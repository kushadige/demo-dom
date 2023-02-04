/// <reference path="base-component.ts" />

namespace App {
    // Project List Class
    export class ProjectList extends Component<HTMLDivElement, HTMLElement> implements DragTarget {
        assignedProjects: Project[] = [];
        listEl: HTMLUListElement;

        constructor(private type: 'active' | 'finished') {
            super('project-list', 'app', false, `${type}-projects`);

            this.listEl = this.renderElement.querySelector('ul')! as HTMLUListElement;

            this.configureElement();
            this.renderContent();
        }

        @Autobind
        dragOverHandler(e: DragEvent): void {
            if (e.dataTransfer && e.dataTransfer.types[0] === 'text/plain') {
                e.preventDefault();
                this.listEl.classList.add('droppable');
            }
        }
        @Autobind
        dragLeaveHandler(e: DragEvent): void {
            const clientRect = this.renderElement.getBoundingClientRect();
            const { left, right, top, height } = clientRect;
            if (
                e.clientX < left ||
                e.clientX > right ||
                e.clientY < top ||
                e.clientY > top + height
            ) {
                this.listEl.removeAttribute('class');
            }
        }
        @Autobind
        dropHandler(e: DragEvent): void {
            this.listEl.removeAttribute('class');

            const srcListElementId = e.dataTransfer!.getData('text/plain');

            if (
                this.listEl.querySelector(`#${srcListElementId}`) ||
                !document.getElementById(srcListElementId)
            ) {
                return;
            }
            this.listEl.insertAdjacentElement(
                'afterbegin',
                document.getElementById(srcListElementId)!
            );
        }

        configureElement(): void {
            this.renderElement.addEventListener('dragover', this.dragOverHandler);
            this.renderElement.addEventListener('dragleave', this.dragLeaveHandler);
            this.renderElement.addEventListener('drop', this.dropHandler);

            projectState.addListener((projects: Project[]) => {
                this.assignedProjects = projects.filter((prj) => {
                    if (this.type === 'active') {
                        return prj.status === ProjectStatus.Active;
                    }
                    return prj.status === ProjectStatus.Finished;
                });
                this.renderProjects();
            });
        }

        renderContent() {
            const listId = `${this.type}-list`;
            this.renderElement.querySelector('ul')!.id = listId;
            this.renderElement.querySelector('h2')!.textContent =
                `${this.type} projects`.toUpperCase();
        }

        private renderProjects() {
            const listEl = document.getElementById(`${this.type}-list`)! as HTMLUListElement;
            listEl.innerHTML = '';
            for (const prjItem of this.assignedProjects) {
                new ProjectItem(`${this.type}-list`, prjItem);
            }
        }
    }
}
