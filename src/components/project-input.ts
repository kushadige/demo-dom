/// <reference path="base-component.ts" />

namespace App {
    // Project Input Class
    export class ProjectInput extends Component<HTMLDivElement, HTMLFormElement> {
        @Required
        @NonNumeric
        titleInputElement: HTMLInputElement;
        @Required
        @NonNumeric
        descriptionInputElement: HTMLInputElement;
        @Positive
        @Required
        peopleInputElement: HTMLInputElement;

        constructor() {
            super('project-input', 'app', true, 'user-input');

            this.titleInputElement = this.renderElement.querySelector('#title') as HTMLInputElement;
            this.descriptionInputElement = this.renderElement.querySelector(
                '#description'
            ) as HTMLInputElement;
            this.peopleInputElement = this.renderElement.querySelector(
                '#people'
            ) as HTMLInputElement;

            this.configureElement();
        }

        renderContent(): void {}

        configureElement() {
            this.renderElement.addEventListener('submit', this.handleSubmit);
        }

        private gatherUserInput(): [string, string, number] {
            const enteredTitle = this.titleInputElement.value;
            const enteredDescription = this.descriptionInputElement.value;
            const enteredPeople = +this.peopleInputElement.value;

            if (!validate(this)) {
                throw new Error('Invalid input, please try again!');
            }

            return [enteredTitle, enteredDescription, enteredPeople];
        }

        private clearForm() {
            this.titleInputElement.value = '';
            this.descriptionInputElement.value = '';
            this.peopleInputElement.value = '';
        }

        @Autobind
        private handleSubmit(e: Event) {
            e.preventDefault();
            try {
                const userInput = this.gatherUserInput();
                const [title, desc, people] = userInput;
                projectState.addProject(title, desc, people);
                this.clearForm();
            } catch (err: any) {
                console.log(err.message);
            }
        }
    }
}
