import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { NewTicketForm } from "@/features/tickets/components/NewTicketForm";

const newTicketSearchSchema = z.object({
  category: z.string().optional(),
});

function NewTicketRoute() {
  const { category } = Route.useSearch();
  return <NewTicketForm preselectedCategory={category} />;
}

export const Route = createFileRoute("/tickets/new")({
  validateSearch: (search) => newTicketSearchSchema.parse(search),
  component: NewTicketRoute,
});
