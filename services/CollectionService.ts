import { CollectionTaskModel } from '@/domains/collections/model';
import { BookingModel } from '@/domains/booking/model';
import { success, failure, Result } from '@/shared/result';

export class CollectionService {
  private bookingService?: import('./BookingService').BookingService;
  private reportsService?: import('./ReportsService').ReportsService;
  private notificationService?: import('./NotificationService').NotificationService;

  constructor() {}

  setBookingService(service: import('./BookingService').BookingService) {
    this.bookingService = service;
  }

  setReportsService(service: import('./ReportsService').ReportsService) {
    this.reportsService = service;
  }

  setNotificationService(service: import('./NotificationService').NotificationService) {
    this.notificationService = service;
  }

  private async _graphqlFetch<T>(query: string, variables?: Record<string, unknown>): Promise<T | null> {
    try {
      const token = typeof window !== 'undefined'
        ? (sessionStorage.getItem('cognito_id_token') || localStorage.getItem('cognito_id_token') || '')
        : '';
      const _url = typeof window === 'undefined' ? (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000') + '/api/graphql' : '/api/graphql';
      const response = await fetch(_url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ query, variables }),
      });
      if (!response.ok) return null;
      const { data, errors } = await response.json();
      if (errors?.length) { console.error('GraphQL errors:', errors); return null; }
      return data as T;
    } catch (err) {
      console.error('GraphQL fetch failed:', err);
      return null;
    }
  }

  async getAll(): Promise<Result<CollectionTaskModel[]>> {
    const data = await this._graphqlFetch<{ collections: CollectionTaskModel[] }>(
      `query {
        collections {
          id type patientId bookingId time date patient address tests assignedTo phlebotomistId status
        }
      }`
    );
    if (data?.collections) return success(data.collections);
    return failure(new Error('Failed to load collections'));
  }

  async getAdminWorkspace(limit = 20, cursor: string | null = null, tab = 'HOME', sort = 'date_oldest', search = '') {
    try {
      const data = await this._graphqlFetch<{ adminCollectionsWorkspace: any }>(
        `query GetWorkspace($limit: Int, $cursor: String, $tab: String, $sort: String, $search: String) {
          adminCollectionsWorkspace(limit: $limit, cursor: $cursor, tab: $tab, sort: $sort, search: $search) {
            queue {
              items {
                id date time status patient address bookingId assignedTo phlebotomistId type lat lng tests
              }
              nextCursor
            }
            stats {
              totalTasks completedTasks enRouteTasks unassignedTasks
            }
            phlebotomists {
              id name role status
            }
          }
        }`,
        { limit, cursor, tab, sort, search }
      );
      if (data?.adminCollectionsWorkspace) return success(data.adminCollectionsWorkspace);
      return failure(new Error('Failed to load collections workspace'));
    } catch (err) {
      return failure(err instanceof Error ? err : new Error('Unknown error'));
    }
  }

  async getByPatientId(patientId: string): Promise<Result<CollectionTaskModel[]>> {
    const data = await this._graphqlFetch<{ collectionsByPatient: CollectionTaskModel[] }>(
      `query CollectionsByPatient($patientId: ID!) {
        collectionsByPatient(patientId: $patientId) {
          id type patientId bookingId time date patient address tests assignedTo phlebotomistId status
        }
      }`,
      { patientId }
    );
    if (data?.collectionsByPatient) return success(data.collectionsByPatient);
    return failure(new Error('Failed to load collections'));
  }

  async create(task: CollectionTaskModel): Promise<Result<CollectionTaskModel>> {
    const data = await this._graphqlFetch<{ createCollection: CollectionTaskModel }>(
      `mutation CreateCollection($input: AWSJSON!) {
        createCollection(input: $input) {
          id type patientId bookingId time date patient address tests assignedTo phlebotomistId status
        }
      }`,
      { input: task }
    );
    if (data?.createCollection) return success(data.createCollection);
    return failure(new Error('Failed to create collection'));
  }

  async createFromBooking(booking: BookingModel): Promise<Result<CollectionTaskModel>> {
    const existingRes = await this.getAll();
    if (existingRes.isSuccess) {
      const existing = existingRes.value.find(t => t.bookingId === booking.id);
      if (existing) return success(existing);
    }
    const task: CollectionTaskModel = {
      id: `COL-${booking.id.replace('B-', '')}`,
      type: booking.collection.type,
      patientId: booking.patientId,
      bookingId: booking.id,
      time: booking.collection.timeSlot,
      date: booking.collection.date,
      patient: booking.patient.name,
      address: booking.collection.address,
      tests: booking.items.map(i => i.name),
      assignedTo: booking.collection.assignedPhlebotomist || 'Unassigned',
      status: booking.collection.type === 'Lab Visit' ? 'Pending' : 'Unassigned',
    };
    return this.create(task);
  }

  async updateTask(id: string, updateData: Partial<CollectionTaskModel>): Promise<Result<CollectionTaskModel>> {
    const data = await this._graphqlFetch<{ updateCollection: CollectionTaskModel }>(
      `mutation UpdateCollection($id: ID!, $input: AWSJSON!) {
        updateCollection(id: $id, input: $input) {
          id type patientId bookingId time date patient address tests assignedTo phlebotomistId status
        }
      }`,
      { id, input: updateData }
    );
    if (data?.updateCollection) return success(data.updateCollection);
    return failure(new Error('Failed to update collection'));
  }

  async assignPhlebotomist(taskId: string, staffId: string, staffName: string): Promise<Result<CollectionTaskModel>> {
    return this.updateTask(taskId, {
      phlebotomistId: staffId,
      assignedTo: staffName,
      status: 'Assigned',
    });
  }

  async markEnRoute(id: string): Promise<Result<CollectionTaskModel>> {
    return this.updateTask(id, { status: 'En Route' });
  }

  async recordSampleCollected(id: string, staffId: string): Promise<Result<CollectionTaskModel>> {
    return this.updateTask(id, {
      status: 'Sample Collected',
      collectedBy: staffId,
      collectedAt: new Date().toISOString()
    });
  }

  async recordCheckIn(id: string): Promise<Result<CollectionTaskModel>> {
    return this.updateTask(id, { status: 'Checked In' });
  }
}
