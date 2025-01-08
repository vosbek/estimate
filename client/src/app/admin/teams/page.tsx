import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"

const insuranceTeams = [
  {
    id: 1,
    name: "Business Analysis",
    description: "Requirements gathering and business process analysis",
    members: 4,
    specialties: ["Process Mapping", "Requirements Documentation", "Stakeholder Management"]
  },
  {
    id: 2,
    name: "Insurance Configuration",
    description: "Product and policy configuration specialists",
    members: 3,
    specialties: ["Policy Setup", "Rating Engine", "Product Rules"]
  },
  {
    id: 3,
    name: "Integration",
    description: "Third-party system integration and API development",
    members: 4,
    specialties: ["API Development", "Middleware", "Data Transformation"]
  },
  {
    id: 4,
    name: "Frontend Development",
    description: "User interface and experience development",
    members: 3,
    specialties: ["React/Angular", "UX Design", "Responsive Design"]
  },
  {
    id: 5,
    name: "Backend Development",
    description: "Core system and database development",
    members: 4,
    specialties: ["Java/.NET", "Database Design", "Business Logic"]
  },
  {
    id: 6,
    name: "Quality Assurance",
    description: "Testing and quality assurance",
    members: 3,
    specialties: ["Test Planning", "Automation", "Performance Testing"]
  },
  {
    id: 7,
    name: "Security & Compliance",
    description: "Security implementation and compliance verification",
    members: 2,
    specialties: ["Security Controls", "Compliance Auditing", "Risk Assessment"]
  },
  {
    id: 8,
    name: "DevOps",
    description: "Infrastructure and deployment automation",
    members: 2,
    specialties: ["CI/CD", "Cloud Infrastructure", "Monitoring"]
  }
]

export default function TeamsManagement() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Teams Management</h2>
          <p className="text-muted-foreground">
            Configure teams and their capabilities for estimation templates
          </p>
        </div>
        <div className="flex gap-4">
          <Button variant="outline" asChild>
            <Link href="/admin">Back to Admin</Link>
          </Button>
          <Button>Add New Team</Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {insuranceTeams.map((team) => (
          <Card key={team.id}>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-lg">{team.name}</h3>
                    <p className="text-sm text-muted-foreground">{team.description}</p>
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <span className="sr-only">Edit team</span>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                      <path d="M5.433 13.917l1.262-3.155A4 4 0 017.58 9.42l6.92-6.918a2.121 2.121 0 013 3l-6.92 6.918c-.383.383-.84.685-1.343.886l-3.154 1.262a.5.5 0 01-.65-.65z" />
                      <path d="M3.5 5.75c0-.69.56-1.25 1.25-1.25H10A.75.75 0 0010 3H4.75A2.75 2.75 0 002 5.75v9.5A2.75 2.75 0 004.75 18h9.5A2.75 2.75 0 0017 15.25V10a.75.75 0 00-1.5 0v5.25c0 .69-.56 1.25-1.25 1.25h-9.5c-.69 0-1.25-.56-1.25-1.25v-9.5z" />
                    </svg>
                  </Button>
                </div>
                
                <div className="space-y-3">
                  <div className="text-sm">
                    <span className="text-muted-foreground">Team Size:</span>
                    <span className="ml-2 font-medium">{team.members} members</span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-sm text-muted-foreground">Specialties:</span>
                    <div className="flex flex-wrap gap-2">
                      {team.specialties.map((specialty, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center rounded-md bg-secondary px-2 py-1 text-xs font-medium"
                        >
                          {specialty}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
} 