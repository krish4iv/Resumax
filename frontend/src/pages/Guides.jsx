// src/pages/Guides.jsx
import ResourceListPage from "../components/resources/ResourceListPage.jsx"
import { guidesContent } from "../data/resourcesContent.js"
export default function Guides() {
  return <ResourceListPage {...guidesContent} />
}   