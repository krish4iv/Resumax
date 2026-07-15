// src/pages/BehavioralQs.jsx
import ResourceListPage from "../components/resources/ResourceListPage.jsx"
import { behavioralContent } from "../data/resourcesContent.js"
export default function BehavioralQs() {
  return <ResourceListPage {...behavioralContent} />
}