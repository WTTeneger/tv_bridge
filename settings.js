export let _appModules = {}
// =
// {
//     '/template_text': {
//         isActive: true,
//         icon: 'person_outline',
//         title: 'Шаблоны текстов',
//         description: 'Шаблоны текстов',
//         as: 'template_text',
//     }
// }

export function _appModulesGet() {
    return _appModules
}

export function _appModulesGetKeys() {
    // gолучить словарь в котором ключ это ключ , а значение false
    let _keys = {}
    for (let key in _appModules) {
        _keys[key] = false
    }
    return _keys;
}

export function _appModulesAdd(title, data) {
    _appModules[title] = data
    return true
}


