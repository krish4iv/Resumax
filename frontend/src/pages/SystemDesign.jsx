// src/pages/SystemDesign.jsx
import ResourceListPage from "../components/resources/ResourceListPage.jsx"
import { systemDesignContent } from "../data/resourcesContent.js"
export default function SystemDesign() {
  return <ResourceListPage {...systemDesignContent} />
}