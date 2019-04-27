/**Add filter for object properties - ES6 */
Object.filter = (obj, predicate) => {
    return Object.assign(...Object.keys(obj)
        .filter(key => predicate(obj[key]))
        .map(key => ({ [key]: obj[key] })));
}