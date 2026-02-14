
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ExtractedData } from '../types';

interface ExtractedDataPanelProps {
  data: ExtractedData;
}

export const ExtractedDataPanel = ({ data }: ExtractedDataPanelProps) => {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    personal: true,
    summary: false,
    experience: false,
    education: false,
    skills: false,
    projects: false,
    certifications: false
  });

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const sections = [
    {
      key: 'personal',
      title: 'Personal Information',
      icon: 'ri-user-line',
      content: (
        <div className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Name</label>
              <p className="text-gray-900 dark:text-white font-semibold">{data.personalInfo.name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Email</label>
              <p className="text-gray-900 dark:text-white font-semibold">{data.personalInfo.email}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Phone</label>
              <p className="text-gray-900 dark:text-white font-semibold">{data.personalInfo.phone}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Location</label>
              <p className="text-gray-900 dark:text-white font-semibold">{data.personalInfo.location}</p>
            </div>
            {data.personalInfo.linkedin && (
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">LinkedIn</label>
                <p className="text-blue-600 dark:text-blue-400 font-semibold">{data.personalInfo.linkedin}</p>
              </div>
            )}
            {data.personalInfo.portfolio && (
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Portfolio</label>
                <p className="text-blue-600 dark:text-blue-400 font-semibold">{data.personalInfo.portfolio}</p>
              </div>
            )}
          </div>
        </div>
      )
    },
    {
      key: 'summary',
      title: 'Professional Summary',
      icon: 'ri-file-text-line',
      content: (
        <div className="space-y-3">
          <p className="text-gray-900 dark:text-white leading-relaxed">
            {data.summary}
          </p>
        </div>
      )
    },
    {
      key: 'experience',
      title: 'Work Experience',
      icon: 'ri-briefcase-line',
      content: (
        <div className="space-y-4">
          {data.experience.length > 0 ? (
            data.experience.map((exp, index) => (
              <div key={index} className="border-l-2 border-blue-200 dark:border-blue-800 pl-4">
                <h4 className="font-semibold text-gray-900 dark:text-white">{exp.title}</h4>
                <p className="text-blue-600 dark:text-blue-400 font-medium">{exp.company}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{exp.duration}</p>
                {exp.location && (
                  <p className="text-sm text-gray-500 dark:text-gray-500">{exp.location}</p>
                )}
                {exp.achievements && exp.achievements.length > 0 && (
                  <ul className="mt-2 space-y-1">
                    {exp.achievements.map((achievement, achIndex) => (
                      <li key={achIndex} className="text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2">
                        <span className="text-blue-500 mt-1">•</span>
                        <span>{achievement}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))
          ) : (
            <p className="text-gray-500 dark:text-gray-400 italic">No work experience found</p>
          )}
        </div>
      )
    },
    {
      key: 'education',
      title: 'Education',
      icon: 'ri-graduation-cap-line',
      content: (
        <div className="space-y-4">
          {data.education.length > 0 ? (
            data.education.map((edu, index) => (
              <div key={index} className="border-l-2 border-green-200 dark:border-green-800 pl-4">
                <h4 className="font-semibold text-gray-900 dark:text-white">{edu.degree}</h4>
                <p className="text-green-600 dark:text-green-400 font-medium">{edu.institution}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{edu.year}</p>
                {edu.gpa && (
                  <p className="text-sm text-gray-500 dark:text-gray-500">GPA: {edu.gpa}</p>
                )}
              </div>
            ))
          ) : (
            <p className="text-gray-500 dark:text-gray-400 italic">No education information found</p>
          )}
        </div>
      )
    },
    {
      key: 'skills',
      title: 'Skills',
      icon: 'ri-tools-line',
      content: (
        <div className="space-y-4">
          {data.skills.technical.length > 0 && (
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Technical Skills</h4>
              <div className="flex flex-wrap gap-2">
                {data.skills.technical.map((skill, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full text-sm font-medium"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
          {data.skills.soft.length > 0 && (
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Soft Skills</h4>
              <div className="flex flex-wrap gap-2">
                {data.skills.soft.map((skill, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 rounded-full text-sm font-medium"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
          {data.skills.technical.length === 0 && data.skills.soft.length === 0 && (
            <p className="text-gray-500 dark:text-gray-400 italic">No skills information found</p>
          )}
        </div>
      )
    },
    {
      key: 'projects',
      title: 'Projects',
      icon: 'ri-code-box-line',
      content: (
        <div className="space-y-4">
          {data.projects.length > 0 ? (
            data.projects.map((project, index) => (
              <div key={index} className="border-l-2 border-purple-200 dark:border-purple-800 pl-4">
                <h4 className="font-semibold text-gray-900 dark:text-white">{project.name}</h4>
                <p className="text-gray-700 dark:text-gray-300 text-sm mt-1">{project.description}</p>
                {project.technologies && project.technologies.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {project.technologies.map((tech, techIndex) => (
                      <span
                        key={techIndex}
                        className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                )}
                {project.link && (
                  <a
                    href={project.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 dark:text-blue-400 text-sm hover:underline mt-1 inline-block"
                  >
                    View Project
                  </a>
                )}
              </div>
            ))
          ) : (
            <p className="text-gray-500 dark:text-gray-400 italic">No projects found</p>
          )}
        </div>
      )
    },
    {
      key: 'certifications',
      title: 'Certifications',
      icon: 'ri-award-line',
      content: (
        <div className="space-y-2">
          {data.certifications.length > 0 ? (
            data.certifications.map((cert, index) => (
              <div key={index} className="flex items-center gap-2">
                <i className="ri-medal-line text-gold-500" />
                <span className="text-gray-900 dark:text-white">{cert}</span>
              </div>
            ))
          ) : (
            <p className="text-gray-500 dark:text-gray-400 italic">No certifications found</p>
          )}
        </div>
      )
    }
  ];

  return (
    <motion.div
      className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-gray-700 shadow-xl overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
    >
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <i className="ri-file-list-3-line text-blue-600 dark:text-blue-400" />
          Extracted Data
        </h3>
        <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
          Information parsed from your resume
        </p>
      </div>

      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {sections.map((section, index) => (
          <motion.div
            key={section.key}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: index * 0.1 }}
          >
            <button
              onClick={() => toggleSection(section.key)}
              className="w-full px-6 py-4 text-left hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors duration-200 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <i className={`${section.icon} text-blue-600 dark:text-blue-400`} />
                <span className="font-semibold text-gray-900 dark:text-white">
                  {section.title}
                </span>
              </div>
              <motion.i
                className="ri-arrow-down-s-line text-gray-400 transition-transform duration-200"
                animate={{ rotate: expandedSections[section.key] ? 180 : 0 }}
              />
            </button>
            
            <AnimatePresence>
              {expandedSections[section.key] && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="px-6 pb-6">
                    {section.content}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};