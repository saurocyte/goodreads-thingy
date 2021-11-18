import axios from 'axios'

const instance = axios.create({
    baseURL: `http://41.216.183.110`,
    headers: {"X-Requested-With" : "XMLHttpRequest"}
})
const parser = new DOMParser()

export async function search(q, page, id=undefined) {
    const { data } = await instance.get(`/bookinfo/${q}`)
    return data
}

export async function get_description(id) {
    const { data } = await instance.get(`/bookdesc/${id}`)
    return data
}