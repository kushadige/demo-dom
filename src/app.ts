/// <reference path="./modals/project-modal.ts" />
/// <reference path="./modals/drag-drop.ts" />
/// <reference path="./decorators/autobind.ts" />
/// <reference path="./utils/validation.ts" />
/// <reference path="./states/project-state.ts" />
/// <reference path="./components/project-input.ts" />
/// <reference path="./components/project-item.ts" />
/// <reference path="./components/project-list.ts" />

namespace App {
    new ProjectInput();
    new ProjectList('active');
    new ProjectList('finished');
}
