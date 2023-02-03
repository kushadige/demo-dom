// Drag n Drop Interfaces
interface Draggable {
	dragStartHandler(e: DragEvent): void;
	dragEndHandler(e: DragEvent): void;
}
interface DragTarget {
	dragOverHandler(e: DragEvent): void;
	dragLeaveHandler(e: DragEvent): void;
	dropHandler(e: DragEvent): void;
}

// Project Type
enum ProjectStatus {
	Active = "active",
	Finished = "finished",
}

class Project {
	constructor(
		public id: string,
		public title: string,
		public description: string,
		public people: number,
		public status: ProjectStatus
	) {}
}

// Project State Management
type Listener<T> = (items: T[]) => void;

class State<T> {
	protected listeners: Listener<T>[] = [];

	addListener(listenerFn: Listener<T>) {
		this.listeners.push(listenerFn);
	}
}

class ProjectState extends State<Project> {
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
			"el_" +
			btoa(
				(Math.random() + 1).toString() + (Math.random() + 1).toString()
			).replaceAll(/=/g, "0");

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

const projectState = ProjectState.getInstance();

// Making the form visible
function Autobind(
	_target: any,
	_methodName: string,
	descriptor: PropertyDescriptor
) {
	const originalMethod = descriptor.value;
	const adjDescriptor: PropertyDescriptor = {
		configurable: true,
		enumerable: false,
		get() {
			const boundFn = originalMethod.bind(this);
			return boundFn;
		},
	};
	return adjDescriptor;
}

interface ValidatorConfig {
	[prop: string | symbol]: {
		[prop: string | symbol]: string[];
	};
}

enum Validators {
	Required = "required",
	Positive = "positive",
	NonNumeric = "non-numeric",
}

const validatorObj: ValidatorConfig = {};

function Required(target: any, propName: string) {
	validatorObj[target.constructor.name] = {
		...(validatorObj[target.constructor.name] ?? []),
		[propName]: [
			...(validatorObj[target.constructor.name]?.[propName] ?? []),
			Validators.Required,
		],
	};
}

function NonNumeric(target: any, propName: string) {
	validatorObj[target.constructor.name] = {
		...(validatorObj[target.constructor.name] ?? []),
		[propName]: [
			...(validatorObj[target.constructor.name]?.[propName] ?? []),
			Validators.NonNumeric,
		],
	};
}

function Positive(target: any, propName: string) {
	validatorObj[target.constructor.name] = {
		...(validatorObj[target.constructor.name] ?? []),
		[propName]: [
			...(validatorObj[target.constructor.name]?.[propName] ?? []),
			Validators.Positive,
		],
	};
}

function validate(target: any) {
	const configs = validatorObj[target.constructor.name];
	if (!configs) {
		return true;
	}
	let isValid = true;
	for (const prop in configs) {
		for (const validator of configs[prop]) {
			switch (validator) {
				case Validators.Required:
					isValid = isValid && target[prop].value.toString().trim().length > 0;
					break;
				case Validators.Positive:
					isValid = isValid && +target[prop].value > 0;
					break;
				case Validators.NonNumeric:
					isValid = isValid && !+target[prop].value;
					break;
			}
		}
	}
	return isValid;
}

// Base Class
abstract class Component<T extends HTMLElement, U extends HTMLElement> {
	templateElement: HTMLTemplateElement;
	hostElement: T;
	renderElement: U;

	constructor(
		templateId: string,
		hostElementId: string,
		insertAtStart: boolean,
		renderElementId?: string
	) {
		this.templateElement = document.getElementById(
			templateId
		)! as HTMLTemplateElement;
		this.hostElement = document.getElementById(hostElementId)! as T;

		const importedNode = document.importNode(
			this.templateElement.content,
			true
		);
		this.renderElement = importedNode.firstElementChild! as U;
		if (renderElementId) {
			this.renderElement.id = renderElementId;
		}
		this.attachElement(insertAtStart);
	}

	private attachElement(insertAtStart: boolean) {
		this.hostElement.insertAdjacentElement(
			insertAtStart ? "afterbegin" : "beforeend",
			this.renderElement
		);
	}

	abstract configureElement(): void;
	abstract renderContent(): void;
}

// Project Input Class
class ProjectInput extends Component<HTMLDivElement, HTMLFormElement> {
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
		super("project-input", "app", true, "user-input");

		this.titleInputElement = this.renderElement.querySelector(
			"#title"
		) as HTMLInputElement;
		this.descriptionInputElement = this.renderElement.querySelector(
			"#description"
		) as HTMLInputElement;
		this.peopleInputElement = this.renderElement.querySelector(
			"#people"
		) as HTMLInputElement;

		this.configureElement();
	}

	renderContent(): void {}

	configureElement() {
		this.renderElement.addEventListener("submit", this.handleSubmit);
	}

	private gatherUserInput(): [string, string, number] {
		const enteredTitle = this.titleInputElement.value;
		const enteredDescription = this.descriptionInputElement.value;
		const enteredPeople = +this.peopleInputElement.value;

		if (!validate(this)) {
			throw new Error("Invalid input, please try again!");
		}

		return [enteredTitle, enteredDescription, enteredPeople];
	}

	private clearForm() {
		this.titleInputElement.value = "";
		this.descriptionInputElement.value = "";
		this.peopleInputElement.value = "";
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

// Project Item Class
class ProjectItem
	extends Component<HTMLUListElement, HTMLLIElement>
	implements Draggable
{
	private project: Project;

	get persons() {
		if (this.project.people === 1) {
			return "1 person";
		} else {
			return this.project.people + " persons";
		}
	}

	constructor(listId: string, project: Project) {
		super("single-project", listId, true, project.id);
		this.project = project;

		this.configureElement();
		this.renderContent();
	}

	@Autobind
	dragStartHandler(e: DragEvent): void {
		e.dataTransfer!.setData("text/plain", this.project.id);
		e.dataTransfer!.effectAllowed = "move";
	}

	@Autobind
	dragEndHandler(_e: DragEvent): void {
		if (this.hostElement.id !== this.renderElement.parentElement!.id) {
			switch (this.project.status) {
				case "active":
					this.project.status = ProjectStatus.Finished;
					break;
				case "finished":
					this.project.status = ProjectStatus.Active;
					break;
			}
			this.hostElement = this.renderElement.parentElement! as HTMLUListElement;
		}
	}

	configureElement(): void {
		this.renderElement.addEventListener("dragstart", this.dragStartHandler);
		this.renderElement.addEventListener("dragend", this.dragEndHandler);
	}
	renderContent(): void {
		this.renderElement.querySelector("h2")!.textContent = this.project.title;
		this.renderElement.querySelector("h3")!.textContent =
			this.persons + " assigned";
		this.renderElement.querySelector("p")!.textContent =
			this.project.description;
	}
}

// Project List Class
class ProjectList
	extends Component<HTMLDivElement, HTMLElement>
	implements DragTarget
{
	assignedProjects: Project[] = [];
	listEl: HTMLUListElement;

	constructor(private type: "active" | "finished") {
		super("project-list", "app", false, `${type}-projects`);

		this.listEl = this.renderElement.querySelector("ul")! as HTMLUListElement;

		this.configureElement();
		this.renderContent();
	}

	@Autobind
	dragOverHandler(e: DragEvent): void {
		if (e.dataTransfer && e.dataTransfer.types[0] === "text/plain") {
			e.preventDefault();
			this.listEl.classList.add("droppable");
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
			this.listEl.removeAttribute("class");
		}
	}
	@Autobind
	dropHandler(e: DragEvent): void {
		this.listEl.removeAttribute("class");

		const srcListElementId = e.dataTransfer!.getData("text/plain");

		if (
			this.listEl.querySelector(`#${srcListElementId}`) ||
			!document.getElementById(srcListElementId)
		) {
			return;
		}
		this.listEl.insertAdjacentElement(
			"afterbegin",
			document.getElementById(srcListElementId)!
		);
	}

	configureElement(): void {
		this.renderElement.addEventListener("dragover", this.dragOverHandler);
		this.renderElement.addEventListener("dragleave", this.dragLeaveHandler);
		this.renderElement.addEventListener("drop", this.dropHandler);

		projectState.addListener((projects: Project[]) => {
			this.assignedProjects = projects.filter((prj) => {
				if (this.type === "active") {
					return prj.status === ProjectStatus.Active;
				}
				return prj.status === ProjectStatus.Finished;
			});
			this.renderProjects();
		});
	}

	renderContent() {
		const listId = `${this.type}-list`;
		this.renderElement.querySelector("ul")!.id = listId;
		this.renderElement.querySelector("h2")!.textContent =
			`${this.type} projects`.toUpperCase();
	}

	private renderProjects() {
		const listEl = document.getElementById(
			`${this.type}-list`
		)! as HTMLUListElement;
		listEl.innerHTML = "";
		for (const prjItem of this.assignedProjects) {
			new ProjectItem(`${this.type}-list`, prjItem);
		}
	}
}

const prjInput = new ProjectInput();
const activePrjList = new ProjectList("active");
const finishedPrjList = new ProjectList("finished");
