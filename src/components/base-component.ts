namespace App {
    // Base Class
    export abstract class Component<T extends HTMLElement, U extends HTMLElement> {
        templateElement: HTMLTemplateElement;
        hostElement: T;
        renderElement: U;

        constructor(
            templateId: string,
            hostElementId: string,
            insertAtStart: boolean,
            renderElementId?: string
        ) {
            this.templateElement = document.getElementById(templateId)! as HTMLTemplateElement;
            this.hostElement = document.getElementById(hostElementId)! as T;

            const importedNode = document.importNode(this.templateElement.content, true);
            this.renderElement = importedNode.firstElementChild! as U;
            if (renderElementId) {
                this.renderElement.id = renderElementId;
            }
            this.attachElement(insertAtStart);
        }

        private attachElement(insertAtStart: boolean) {
            this.hostElement.insertAdjacentElement(
                insertAtStart ? 'afterbegin' : 'beforeend',
                this.renderElement
            );
        }

        abstract configureElement(): void;
        abstract renderContent(): void;
    }
}
