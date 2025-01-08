import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"

const insuranceWorkUnits = [
  {
    id: 1,
    team: "Business Analysis",
    units: [
      {
        name: "Business Requirements Document",
        description: "Complete BRD for new insurance product",
        hours: 40,
        deliverables: ["Process Flows", "Requirements Matrix", "User Stories"]
      },
      {
        name: "Stakeholder Workshops",
        description: "Requirements gathering workshops",
        hours: 16,
        deliverables: ["Workshop Materials", "Meeting Minutes", "Action Items"]
      }
    ]
  },
  {
    id: 2,
    team: "Insurance Configuration",
    units: [
      {
        name: "Product Setup",
        description: "Basic insurance product configuration",
        hours: 24,
        deliverables: ["Product Rules", "Rating Tables", "Documentation"]
      },
      {
        name: "Rating Engine Configuration",
        description: "Configure rating algorithms and rules",
        hours: 32,
        deliverables: ["Rating Logic", "Testing Scenarios", "Validation Rules"]
      }
    ]
  },
  {
    id: 3,
    team: "Integration",
    units: [
      {
        name: "Payment Gateway Integration",
        description: "Setup payment processing integration",
        hours: 40,
        deliverables: ["API Integration", "Error Handling", "Transaction Flows"]
      },
      {
        name: "Document Management",
        description: "Document generation and storage setup",
        hours: 24,
        deliverables: ["Templates", "Storage Configuration", "Access Controls"]
      }
    ]
  },
  {
    id: 4,
    team: "Frontend Development",
    units: [
      {
        name: "Quote Interface",
        description: "Insurance quote form and display",
        hours: 32,
        deliverables: ["UI Components", "Form Validation", "Quote Summary"]
      },
      {
        name: "Policy Management UI",
        description: "Policy administration interface",
        hours: 40,
        deliverables: ["Dashboard", "Policy Views", "Admin Controls"]
      }
    ]
  },
  {
    id: 5,
    team: "Backend Development",
    units: [
      {
        name: "Policy Management API",
        description: "Core policy management endpoints",
        hours: 48,
        deliverables: ["API Endpoints", "Business Logic", "Data Models"]
      },
      {
        name: "Workflow Engine",
        description: "Insurance workflow implementation",
        hours: 40,
        deliverables: ["Workflow Rules", "State Management", "Event Handlers"]
      }
    ]
  }
]

export default function WorkUnitsManagement() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Work Units</h2>
          <p className="text-muted-foreground">
            Manage standard work units and their time estimates
          </p>
        </div>
        <div className="flex gap-4">
          <Button variant="outline" asChild>
            <Link href="/admin">Back to Admin</Link>
          </Button>
          <Button>Add Work Unit</Button>
        </div>
      </div>

      <div className="grid gap-8">
        {insuranceWorkUnits.map((teamUnits) => (
          <Card key={teamUnits.id}>
            <CardContent className="pt-6">
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">{teamUnits.team}</h3>
                  <Button variant="outline" size="sm">Add Unit</Button>
                </div>
                
                <div className="grid gap-4 md:grid-cols-2">
                  {teamUnits.units.map((unit, index) => (
                    <div key={index} className="border rounded-lg p-4 space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">{unit.name}</h4>
                          <p className="text-sm text-muted-foreground">{unit.description}</p>
                        </div>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <span className="sr-only">Edit unit</span>
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                            <path d="M5.433 13.917l1.262-3.155A4 4 0 017.58 9.42l6.92-6.918a2.121 2.121 0 013 3l-6.92 6.918c-.383.383-.84.685-1.343.886l-3.154 1.262a.5.5 0 01-.65-.65z" />
                            <path d="M3.5 5.75c0-.69.56-1.25 1.25-1.25H10A.75.75 0 0010 3H4.75A2.75 2.75 0 002 5.75v9.5A2.75 2.75 0 004.75 18h9.5A2.75 2.75 0 0017 15.25V10a.75.75 0 00-1.5 0v5.25c0 .69-.56 1.25-1.25 1.25h-9.5c-.69 0-1.25-.56-1.25-1.25v-9.5z" />
                          </svg>
                        </Button>
                      </div>
                      <div className="text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Hours:</span>
                          <span className="font-medium">{unit.hours}</span>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <span className="text-sm text-muted-foreground">Deliverables:</span>
                        <div className="flex flex-wrap gap-2">
                          {unit.deliverables.map((deliverable, idx) => (
                            <span
                              key={idx}
                              className="inline-flex items-center rounded-md bg-secondary px-2 py-1 text-xs font-medium"
                            >
                              {deliverable}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
} 