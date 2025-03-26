// components/JobCard.js
import React, { useEffect, useRef, useState } from "react";

const JobCard = ({ job }) => {
  const cardRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(cardRef.current); // Stop observing once visible
        }
      },
      { threshold: 0.1 } // Trigger when 10% of the element is visible
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => {
      if (cardRef.current) {
        observer.unobserve(cardRef.current);
      }
    };
  }, []);

  return (
    <div ref={cardRef} className={`job-card ${isVisible ? "visible" : ""}`}>
      <div className="job-card-header">
        <h2>Job Vacancy</h2>
      </div>
      <div className="job-card-body">
        <h3 className="job-title">{job.title}</h3>
        <div className="job-details">
          <strong>Location:</strong> {job.location}
          <br />
          <strong>Company:</strong> {job.company}
          <br />
          <strong>Experience:</strong> {job.experience}
          <br />
          <strong>Skills:</strong> {job.skills}
        </div>
        <a href="#" className="apply-button">
          Apply Now
        </a>
      </div>
      <div className="job-card-footer">Posted on: {job.postDate}</div>
      <style jsx>{`
        .job-card {
          width: 350px;
          border-radius: 10px;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
          overflow: hidden;
          font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
          margin: 20px auto;
          background: linear-gradient(135deg, #e0f7fa, #c2e9fb);
          opacity: 0;
          transform: translateY(20px);
          transition: opacity 0.5s ease, transform 0.5s ease;
        }

        .job-card.visible {
          opacity: 1;
          transform: translateY(0);
        }

        .job-card-header {
          background-color: #03a9f4;
          color: white;
          padding: 20px;
          text-align: center;
        }

        .job-card-body {
          padding: 20px;
        }

        .job-title {
          font-size: 1.5em;
          margin-bottom: 10px;
          color: #333;
        }

        .job-details {
          margin-bottom: 15px;
          line-height: 1.6;
          color: #555;
        }

        .job-details strong {
          font-weight: 600;
          color: #222;
        }

        .apply-button {
          display: block;
          width: 100%;
          padding: 12px;
          background-color: #4caf50;
          color: white;
          text-align: center;
          text-decoration: none;
          border-radius: 5px;
          border: none;
          cursor: pointer;
          transition: background-color 0.3s ease;
        }

        .apply-button:hover {
          background-color: #45a049;
        }

        .job-card-footer {
          padding: 10px 20px;
          text-align: center;
          font-size: 0.8em;
          color: #777;
        }
      `}</style>
    </div>
  );
};

export default JobCard;
