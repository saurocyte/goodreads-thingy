import axios from 'axios'

const instance = axios.create({
    baseURL: 'https://www.googleapis.com/books/v1/'
})

export async function search(q) {
    const data = await instance.get(`/volumes?q=${q}`)
    return data
}

search('feynman').then(console.log)