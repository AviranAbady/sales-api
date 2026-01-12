import {IDatabaseService, DatabaseService} from './database';
import {LocalTestsDatabaseService} from './mock-database';
import {MockCheckAvailabilityService} from './item-availability';
import {MockMessageBroker} from './message-broker';

function initDatabase(): IDatabaseService {
    return process.env.NODE_ENV === 'test'
        ? new LocalTestsDatabaseService()
        : new DatabaseService();
}

// Services can be initialized with different implementations
// (for example, a different database or message broker)
// for simplicity, implemented a test variant for the database only

const db = initDatabase();
const availabilityService = new MockCheckAvailabilityService();
const messageBroker = new MockMessageBroker();
export {db, availabilityService, messageBroker};