// src/pages/Templates.jsx
import ResourceListPage from "../components/resources/ResourceListPage.jsx"
import { templatesContent } from "../data/resourcesContent.js"
export default function Templates() {
  return <ResourceListPage {...templatesContent} />
}