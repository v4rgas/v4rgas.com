import React from "react";

const Experience = () => {
    const experiences = [
        {
            title: "Blar.io — Founding Engineer",
            date: "Oct 2024 - Present",
        },
        {
            title: "Capstone Project — Frontend Lead",
            date: "Mar 2024 - Jul 2024",
        },
        {
            title: "SignatureApi — Freelancer",
            date: "Nov 2023 - Jan 2024",
        },
        {
            title: "Pontificia Universidad Católica de Chile — TA",
            date: "Mar 2022 - Jul 2022",
        },
    ];

    return (
        <main>
            <h1>Experience</h1>
            <div className="experience-cards">
                {experiences.map((experience, index) => (
                    <div className="card" key={index}>
                        <h2>{experience.title}</h2>
                        <p>{experience.date}</p>
                    </div>
                ))}
            </div>
        <style jsx>{`
            .experience-cards {
                display: flex;
                flex-direction: column;
                gap: 1rem;
            }
            .card {
                border: 1px solid var(--color-border);
                padding: 1rem;
            }
        `}</style>
        </main>
    );
};

export default Experience;
