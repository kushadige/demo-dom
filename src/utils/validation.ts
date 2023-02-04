namespace App {
    interface ValidatorConfig {
        [prop: string | symbol]: {
            [prop: string | symbol]: string[];
        };
    }

    enum Validators {
        Required = 'required',
        Positive = 'positive',
        NonNumeric = 'non-numeric',
    }

    const validatorObj: ValidatorConfig = {};

    export function Required(target: any, propName: string) {
        validatorObj[target.constructor.name] = {
            ...(validatorObj[target.constructor.name] ?? []),
            [propName]: [
                ...(validatorObj[target.constructor.name]?.[propName] ?? []),
                Validators.Required,
            ],
        };
    }

    export function NonNumeric(target: any, propName: string) {
        validatorObj[target.constructor.name] = {
            ...(validatorObj[target.constructor.name] ?? []),
            [propName]: [
                ...(validatorObj[target.constructor.name]?.[propName] ?? []),
                Validators.NonNumeric,
            ],
        };
    }

    export function Positive(target: any, propName: string) {
        validatorObj[target.constructor.name] = {
            ...(validatorObj[target.constructor.name] ?? []),
            [propName]: [
                ...(validatorObj[target.constructor.name]?.[propName] ?? []),
                Validators.Positive,
            ],
        };
    }

    export function validate(target: any) {
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
}
