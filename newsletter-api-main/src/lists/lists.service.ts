import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateListDto } from './dto/create-list.dto';
import { UpdateListDto } from './dto/update-list.dto';
import { List } from './entities/list.entity';
import { Organization } from '../organizations/entities/organization.entity';
import { Subscriber } from '../subscribers/entities/subscriber.entity';
import { InjectKnex } from 'nestjs-knex';
import * as fs from 'fs';
import * as csv from 'fast-csv';
import { Knex } from 'knex';

@Injectable()
export class ListService {
  constructor(
    @InjectRepository(List)
    private listRepository: Repository<List>,
    @InjectRepository(Organization)
    private organizationRepository: Repository<Organization>,
    @InjectRepository(Subscriber)
    private subscriberRepository: Repository<Subscriber>,
    @InjectKnex() private readonly knex: Knex,
  ) {}

  async create(createListDto: CreateListDto) {
    const list = new List();
    list.name = createListDto.name;
    list.customFields =
      createListDto.customFields;

    if (createListDto.organizationId) {
      const organization =
        await this.organizationRepository.findOne(
          {
            where: {
              id: createListDto.organizationId,
            },
          },
        );
      if (organization) {
        list.organization = organization;
      }
    }

    return this.listRepository.save(list);
  }

  findAll(organizationId?: string) {
    const where: any = {};
    if (organizationId) {
      where.organization = { id: organizationId };
    }
    return this.listRepository.find({
      where,
      relations: ['organization'],
    });
  }

  async update(
    id: string,
    updateListDto: UpdateListDto,
  ) {
    const list =
      await this.listRepository.findOne({
        where: { id },
      });
    if (!list) {
      throw new Error('List not found');
    }

    if (updateListDto.name)
      list.name = updateListDto.name;
    if (updateListDto.customFields)
      list.customFields =
        updateListDto.customFields;

    if (updateListDto.organizationId) {
      const organization =
        await this.organizationRepository.findOne(
          {
            where: {
              id: updateListDto.organizationId,
            },
          },
        );
      if (organization) {
        list.organization = organization;
      }
    }
    return this.listRepository.save(list);
  }

  async importCsv(
    listId: string,
    filePath: string,
  ) {
    const list =
      await this.listRepository.findOne({
        where: { id: listId },
        relations: ['organization'],
      });
    if (!list)
      throw new NotFoundException(
        'List not found',
      );

    const org = list.organization;
    if (!org)
      throw new BadRequestException(
        'List is not associated with an organization',
      );

    const tempData: Partial<Subscriber>[] = [];
    const seenEmails = new Set<string>();
    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    return new Promise((resolve, reject) => {
      fs.createReadStream(filePath)
        .pipe(csv.parse({ headers: true }))
        .on('error', (err) => {
          console.error(
            `[CSV Error] Stream error: ${err.message}`,
          );
          reject(
            new BadRequestException(
              `CSV parsing error: ${err.message}`,
            ),
          );
        })
        .on('data', (row) => {
          const emailKey = Object.keys(row).find(
            (k) => k.toLowerCase() === 'email',
          );
          const rawEmail = emailKey
            ? row[emailKey]
            : null;
          const email = rawEmail
            ?.trim()
            .toLowerCase();

          if (!email || !emailRegex.test(email))
            return;
          if (seenEmails.has(email)) return;
          seenEmails.add(email);

          const customFields: Record<
            string,
            any
          > = {};
          for (const key of Object.keys(row)) {
            if (key.toLowerCase() !== 'email') {
              const value = row[key]?.trim();
              if (value)
                customFields[key] = value;
            }
          }

          tempData.push({
            email,
            customFields,
            organization: org,
          });
        })
        .on('end', async () => {
          try {
            if (seenEmails.size === 0) {
              fs.unlinkSync(filePath);
              return resolve({
                totalCsvRows: 0,
                alreadyExisted: 0,
                newlyAdded: 0,
                skipped: 0,
                message:
                  'No valid subscribers found in the CSV file. Please check your headers (column named "email" required).',
              });
            }

            const existing =
              await this.subscriberRepository
                .createQueryBuilder('subscriber')
                .select('subscriber.email')
                .where(
                  'subscriber.organizationId = :orgId',
                  { orgId: org.id },
                )
                .andWhere(
                  'subscriber.email IN (:...emails)',
                  {
                    emails:
                      Array.from(seenEmails),
                  },
                )
                .getMany();

            const existingEmails = new Set(
              existing.map((s) =>
                s.email.toLowerCase(),
              ),
            );
            const newSubscribers =
              tempData.filter(
                (s) =>
                  !existingEmails.has(s.email),
              );

            const seen = new Set();
            const finalSubscribers =
              newSubscribers.filter((s) => {
                if (seen.has(s.email))
                  return false;
                seen.add(s.email);
                return true;
              });

            if (finalSubscribers.length > 0) {
              const created =
                this.subscriberRepository.create(
                  finalSubscribers,
                );
              await this.subscriberRepository.save(
                created,
              );
            }

            fs.unlinkSync(filePath);
            resolve({
              totalCsvRows: seenEmails.size,
              alreadyExisted: existingEmails.size,
              newlyAdded: finalSubscribers.length,
              skipped:
                seenEmails.size -
                finalSubscribers.length,
              message: `✅ Imported ${finalSubscribers.length} new subscribers. Skipped ${existingEmails.size} duplicates.`,
            });
          } catch (err) {
            console.error(
              `[CSV Error] Finalization failed: ${err.message}`,
              err.stack,
            );
            if (fs.existsSync(filePath))
              fs.unlinkSync(filePath);
            reject(
              new BadRequestException(
                `Error processing CSV database operations: ${err.message}`,
              ),
            );
          }
        });
    });
  }

  async segmentSubscribers(
    listId: string,
    filters: Record<string, any>,
    pagination?: {
      limit: number;
      offset: number;
    },
  ) {
    const list =
      await this.listRepository.findOne({
        where: { id: listId },
        relations: ['organization'],
      });

    if (!list)
      throw new NotFoundException(
        'List not found',
      );
    if (!list.organization)
      throw new BadRequestException(
        'List not linked to organization',
      );

    const combinedFilters = {
      ...(filters || {}),
      ...(list.customFields || {}),
    };

    const query = this.subscriberRepository
      .createQueryBuilder('subscriber')
      .where(
        'subscriber.organizationId = :orgId',
        { orgId: list.organization.id },
      );

    for (const [key, value] of Object.entries(
      combinedFilters,
    )) {
      if (!/^[a-zA-Z0-9_]+$/.test(key)) {
        throw new BadRequestException(
          `Invalid filter key: ${key}`,
        );
      }
      query.andWhere(
        'LOWER(jsonb_extract_path_text(subscriber.customFields, :filterKey)) = LOWER(:filterValue)',
        {
          filterKey: key,
          filterValue: String(value),
        },
      );
    }

    if (pagination) {
      query
        .take(pagination.limit)
        .skip(pagination.offset);
    }

    const results = await query.getMany();

    return {
      total: results.length,
      filters,
      data: results,
    };
  }

  async getByCidTx(
    tx: Knex.Transaction,
    listCid: string,
  ) {
    try {
      console.log(listCid);
      const list = await tx('lists')
        .where({ id: listCid })
        .first();
      console.log('list', list);
      if (!list) {
        throw new Error(
          `List with CID ${listCid} not found`,
        );
      }

      return list;
    } catch (error) {
      console.error(
        'Error fetching list by CID:',
        error,
      );
      throw error;
    }
  }
}
