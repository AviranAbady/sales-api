interface ICheckAvailabilityService {
    check(items: Array<{ productId: string; quantity: number }>): Promise<boolean>;
}

class MockCheckAvailabilityService implements ICheckAvailabilityService {
    async check(items: Array<{ productId: string; quantity: number }>): Promise<boolean> {
        return true;
    }
}

export {ICheckAvailabilityService, MockCheckAvailabilityService};