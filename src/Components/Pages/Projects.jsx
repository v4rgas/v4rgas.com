import React from "react";
import { useEffect, useState } from "react";

const projects = [
    {
        name: "Blarify",
        readmeUrl: "https://raw.githubusercontent.com/blarApp/blarify/refs/heads/main/README.md",
        repoUrl: "https://github.com/blarApp/blarify",
        description: "Transforms code into a graph structure for LLMs to analyze and traverse.",
        emoji: "🧠",
    },
    {
        name: "SortEm",
        readmeUrl: "https://raw.githubusercontent.com/v4rgas/sortEm/main/README.md",
        demoUrl: "https://v4rgas.github.io/sortEm/",
        repoUrl: "https://github.com/v4rgas/sortEm",
        description: "A fast-paced game to sort numbers in ascending order.",
        emoji: "🔢",
    },
    {
        name: "Whack It!",
        readmeUrl: "https://raw.githubusercontent.com/v4rgas/whack-it/main/README.md",
        repoUrl: "https://github.com/v4rgas/whack-it",
        description: "ESP32-based version of Bop It! with audio and OTA updates.",
        emoji: "🎮",
    },
    {
        name: "HairlessLifting",
        readmeUrl: "https://raw.githubusercontent.com/v4rgas/HairlessLifting/main/README.md",
        demoUrl: "https://v4rgas.github.io/HairlessLifting/",
        repoUrl: "https://github.com/v4rgas/HairlessLifting",
        description: "Workout tracker PWA with 190+ exercises and video demos.",
        emoji: "🏋️",
    },
    {
        name: "PicoHero",
        readmeUrl: "https://raw.githubusercontent.com/v4rgas/PicoHero/main/README.md",
        repoUrl: "https://github.com/v4rgas/PicoHero",
        description: "Uses Raspberry Pi Pico to connect a Wii Guitar Hero controller to PC.",
        emoji: "🎸",
    },
    {
        name: "Talk2Me",
        readmeUrl: "https://raw.githubusercontent.com/v4rgas/talk2me/main/README.md",
        demoUrl: "https://v4rgas.github.io/talk2me/",
        repoUrl: "https://github.com/v4rgas/talk2me",
        description: "Accessible PWA for typing with limited input, like tap or pause buttons.",
        emoji: "🗣️",
    },
];
const getRepoStars = async (repoUrl) => {
    const apiUrl = repoUrl.replace("https://github.com/", "https://api.github.com/repos/");
    const response = await fetch(apiUrl);
    const data = await response.json();
    return data.stargazers_count || null;
};

const ProjectCard = ({ project }) => {
    const [stars, setStars] = useState(null);

    useEffect(() => {
        const fetchStars = async () => {
            const starCount = await getRepoStars(project.repoUrl);
            setStars(starCount);
        };
        fetchStars();
    }, [project.repoUrl]);

    return (
        <div style={{ border: "1px solid var(--color-border)", padding: "1rem", width: "100%", boxSizing: "border-box" }}>
            <h2>
                {project.emoji} {project.name}
            </h2>
            <p>{project.description}</p>
            <div>
                <a href={project.repoUrl} target="_blank" rel="noopener noreferrer">
                    Repository
                </a>
                {project.demoUrl && (
                    <>
                        {" | "}
                        <a href={project.demoUrl} target="_blank" rel="noopener noreferrer">
                            Demo
                        </a>
                    </>
                )}
            </div>
            {stars !== null && <p>⭐ {stars} stars</p>}
        </div>
    );
};

const Projects = () => (
    <div
        style={{
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
            justifyContent: "space-between",
        }}
    >
        <h1>Projects</h1>
        {projects.map((project) => (
            <ProjectCard key={project.name} project={project} />
        ))}
    </div>
);

export default Projects;