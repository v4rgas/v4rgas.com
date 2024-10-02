import { useState } from "preact/hooks"

const useGithubFetcher = () => {
    const [fetchCache, setFetchCache] = useState({})

    function fetchText(url) {
        if (fetchCache[url]) {
            console.log('fetching from cache')
            return Promise.resolve(fetchCache[url])
        }
        return fetch(url)
            .then(response => response.text())
            .then(text => {
                setFetchCache({ ...fetchCache, [url]: text })
                return text
            })
    }

    function getProjectReadme(project) {
        return fetchText(project.readmeUrl)
    }

    return { getProjectReadme }

}

export default useGithubFetcher
