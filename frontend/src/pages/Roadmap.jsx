// src/pages/Roadmaps.jsx
import ResourceListPage from "../components/resources/ResourceListPage.jsx"
import { roadmapsContent } from "../data/resourcesContent.js"
export default function Roadmaps() {
  return <ResourceListPage {...roadmapsContent} />
}