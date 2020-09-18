import axios from 'axios'

// GoodReads limit is 1 request / second
// cors-anywhere limit is 200 requests per hour

const key = 'Pgmx0gQaF4Bojtz9EtV8uA'
const instance = axios.create({
    baseURL: 'https://cors-anywhere.herokuapp.com/www.goodreads.com/',
    headers: {"X-Requested-With" : "XMLHttpRequest"}
})
const parser = new DOMParser()

export async function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/*
export function search_all(qseq, fn) {
    const loop = async () => {
      for (const [i, t] of qseq.entries()) {
        await wait(1000)
        search(t, 1).then(fn)
      }
    }
    loop()
}
*/

export async function search(q, page, id=undefined) {
    console.log('searching ', `https://www.goodreads.com/search/index.xml?q=${q}&page=${page}&key=${key}`)
    const { data } = await instance.get(`/search/index.xml?q=${q}&page=${page}&key=${key}`)
    const xml = parser.parseFromString(data, 'text/xml')
    const works = Array.from(xml.getElementsByTagName('work'))
        .map(w => {
            const select = (q) => w.querySelector(q).textContent.trim()
            return {
                title: select('title'),
                author: select('author').match(/^\d+\n\s+(.*)$/)[1],
                cover_img: select('image_url'),
                avg_rating: select('average_rating'),
                id: select('id')
            }
        })
    if (id) { return [id, works] }
    return works
}

export async function get_description(id) {
    console.log(`retrieving description from /book/show/${id}?format=xml&key=${key}` )
    const { data } = await instance.get(`/book/show/${id}?format=xml&key=${key}`)
    const xml = parser.parseFromString(data, 'text/xml')
    return xml.querySelector('description').textContent.trim()
}

// search('feynman', 1)
//    .then(() => console.log('GOODREADS GOOO'), 
//          () => console.log('FUCK GOODREADS'))