// src/pages/ProjectsResource.jsx  (named to avoid clashing with any Project type elsewhere)
import ResourceListPage from "../components/resources/ResourceListPage.jsx"
import { projectsContent } from "../data/resourcesContent.js"
export default function ProjectsResource() {
  return <ResourceListPage {...projectsContent} />
}