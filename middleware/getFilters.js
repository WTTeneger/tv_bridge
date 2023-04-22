import { Op } from "sequelize"

const isEmpty = (obj) => {
    return (
        obj
        && Object.keys(obj).length === 0
        && Object.getPrototypeOf(obj) === Object.prototype)
}

export const getFilters = (req, res, next) => {
    let rq = JSON.parse(req.query[0])
    let { pagination, filters, sorter } = rq
    console.log(rq);
    let filters_ = {}
    // если pagination == {}

    pagination = !isEmpty(pagination) ? pagination : {
        current: 1,
        pageSize: 10
    }
    filters = !isEmpty(filters) ? filters : {}
    if (!isEmpty(sorter)) {
        sorter = {
            field: 'createdAt',
            order: 'descend'
        }
    } else {
        sorter = {
            field: sorter.field || 'createdAt',
            order: sorter.order || 'descend'
        }
    }
    
    console.log(sorter);

    let where = {}

    for (const i of Object.keys(filters)) {
        if (filters[i] === null) { continue }
        where[i] = {
            // проверить значение из массива [active, deleted]
            [Op.in]: filters[i]
        }
    }
    let order = [
        [sorter.field, sorter.order === 'descend' ? 'DESC' : 'ASC']
    ]
    filters_ = {
        ...filters_,
        pagination: pagination,
        filters: filters,
        where: where,
        order: order,
    }





    req.filters = filters_
    next()
}