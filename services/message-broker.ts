interface IMessageBroker {
    publish(queue: string, payload: object): Promise<boolean>;
}

class MockMessageBroker implements IMessageBroker {
    async publish(queue: string, payload: object): Promise<boolean> {
        return true;
    }
}

export {IMessageBroker, MockMessageBroker};
  