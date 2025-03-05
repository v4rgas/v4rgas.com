import { useEffect } from "preact/hooks"

import PROJECTS from "./assets/projects.json"

const cache = new Map()

const useGithubFetcher = () => {
    function fetchText(url) {
        if (cache.has(url)) {
            console.log('fetching from cache')
            return Promise.resolve(cache.get(url))
        }

        return fetch(url)
            .then(response => response.text())
            .then(text => {
                cache.set(url, text)
                preloadImages(text)
                return text
            })
    }

    function preloadImages(text) {
        const imageRegex = /!\[.*?\]\((.*?)\)/g
        const imageUrls = Array.from(text.matchAll(imageRegex), match => match[1])
        imageUrls.forEach(url => {
            const img = new Image()
            img.src = url
        })
    }

    useEffect(() => {
        PROJECTS.forEach(project => {
            fetchText(project.readmeUrl)
        })
    }, [])

    function getProjectReadme(project) {
        return fetchText(project.readmeUrl)
    }

    return { getProjectReadme }
}

export default useGithubFetcher
