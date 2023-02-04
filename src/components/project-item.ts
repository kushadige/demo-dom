/// <reference path="base-component.ts" />

namespace App {
    // Project Item Class
    export class ProjectItem
        extends Component<HTMLUListElement, HTMLLIElement>
        implements Draggable
    {
        private project: Project;

        get persons() {
            if (this.project.people === 1) {
                return '1 person';
            } else {
                return this.project.people + ' persons';
            }
        }

        constructor(listId: string, project: Project) {
            super('single-project', listId, true, project.id);
            this.project = project;

            this.configureElement();
            this.renderContent();
        }

        @Autobind
        dragStartHandler(e: DragEvent): void {
            e.dataTransfer!.setData('text/plain', this.project.id);
            e.dataTransfer!.effectAllowed = 'move';
        }

        @Autobind
        dragEndHandler(_e: DragEvent): void {
            if (this.hostElement.id !== this.renderElement.parentElement!.id) {
                switch (this.project.status) {
                    case 'active':
                        this.project.status = ProjectStatus.Finished;
                        break;
                    case 'finished':
                        this.project.status = ProjectStatus.Active;
                        break;
                }
                this.hostElement = this.renderElement.parentElement! as HTMLUListElement;
            }
        }

        configureElement(): void {
            this.renderElement.addEventListener('dragstart', this.dragStartHandler);
            this.renderElement.addEventListener('dragend', this.dragEndHandler);
        }
        renderContent(): void {
            this.renderElement.querySelector('h2')!.textContent = this.project.title;
            this.renderElement.querySelector('h3')!.textContent = this.persons + ' assigned';
            this.renderElement.querySelector('p')!.textContent = this.project.description;
        }
    }
}
