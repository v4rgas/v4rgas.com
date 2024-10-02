import { useEffect, useState } from "preact/hooks"

import PROJECTS from "./assets/projects.json"

const cache = new Map()

const useGithubFetcher = () => {
    // const [fetchCache, setFetchCache] = useState({})

    function fetchText(url) {
        if (cache.has(url)) {
            console.log('fetching from cache')
            return Promise.resolve(cache.get(url))
        }

        return fetch(url)
            .then(response => response.text())
            .then(text => {
                cache.set(url, text)
                return text
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
