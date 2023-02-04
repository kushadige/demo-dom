namespace App {
    // Project State Management
    type Listener<T> = (items: T[]) => void;

    class State<T> {
        protected listeners: Listener<T>[] = [];

        addListener(listenerFn: Listener<T>) {
            this.listeners.push(listenerFn);
        }
    }

    export class ProjectState extends State<Project> {
        private projects: Project[] = [];
        private static instance: ProjectState;

        private constructor() {
            super();
        }

        static getInstance() {
            if (this.instance) {
                return this.instance;
            }
            this.instance = new ProjectState();
            return this.instance;
        }

        addProject(title: string, description: string, people: number) {
            const randomId =
                'el_' +
                btoa((Math.random() + 1).toString() + (Math.random() + 1).toString()).replaceAll(
                    /=/g,
                    '0'
                );

            const newProject = new Project(
                randomId,
                title,
                description,
                people,
                ProjectStatus.Active
            );
            this.projects.push(newProject);
            this.updateListeners();
        }

        moveProject(projectId: string, newStatus: ProjectStatus) {
            const project = this.projects.find((prj) => prj.id === projectId);
            if (project) {
                project.status = newStatus;
                this.updateListeners();
            }
        }

        private updateListeners() {
            for (const listenerFn of this.listeners) {
                listenerFn(this.projects.slice());
            }
        }
    }

    export const projectState = ProjectState.getInstance();
}
