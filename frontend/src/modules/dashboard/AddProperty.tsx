import { useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

// 1. Define your Zod schema
const formSchema = z.object({
  propertyName: z.string().min(2, {
    message: "Property name must be at least 2 characters.",
  }).max(50, {
    message: "Property name must not exceed 50 characters."
  }),
  location: z.string().min(5, {
    message: "Location must be at least 5 characters.",
  }),
  taxId: z.string().regex(/^[A-Za-z0-9]+$/, {
    message: "Tax ID must be alphanumeric.",
  }),
  capacity: z.coerce.number().min(1, {
    message: "Capacity must be at least 1.",
  }),
});

export default function AddProperty() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // 2. Initialize react-hook-form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      propertyName: "",
      location: "",
      taxId: "",
      capacity: 0,
    },
  });

  // 3. Define a submit handler
  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    setSuccessMessage("");
    
    // Simulate API call
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      console.log(values);
      setSuccessMessage(`Property "${values.propertyName}" successfully added!`);
      form.reset();
    } catch (error) {
      console.error(error);
      form.setError("root", { message: "An unexpected error occurred. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-6 md:p-8 items-center justify-center">
      <Card className="w-full max-w-2xl bg-card border-border text-foreground backdrop-blur-md">
        <CardHeader>
          <CardTitle className="text-2xl">Add New Property</CardTitle>
          <CardDescription className="text-muted-foreground">
            Create a new property under your ownership. Fill in the details below.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="propertyName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Property Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Grand Hotel" className="bg-background border-border" {...field} />
                      </FormControl>
                      <FormDescription className="text-muted-foreground/70">
                        The public name of your property.
                      </FormDescription>
                      <FormMessage className="text-destructive" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. 123 Beach Ave, Miami, FL" className="bg-background border-border" {...field} />
                      </FormControl>
                      <FormDescription className="text-muted-foreground/70">
                        Full physical address.
                      </FormDescription>
                      <FormMessage className="text-destructive" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="taxId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tax ID</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. 123456789" className="bg-background border-border" {...field} />
                      </FormControl>
                      <FormDescription className="text-muted-foreground/70">
                        Business tax identification number.
                      </FormDescription>
                      <FormMessage className="text-destructive" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="capacity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Capacity (Rooms/Tables)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="e.g. 150" className="bg-background border-border" {...field} />
                      </FormControl>
                      <FormDescription className="text-muted-foreground/70">
                        Total capacity of the property.
                      </FormDescription>
                      <FormMessage className="text-destructive" />
                    </FormItem>
                  )}
                />
              </div>

              {form.formState.errors.root && (
                <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-md text-red-200 text-sm">
                  {form.formState.errors.root.message}
                </div>
              )}

              {successMessage && (
                <div className="p-3 bg-emerald-500/20 border border-emerald-500/50 rounded-md text-emerald-200 text-sm">
                  {successMessage}
                </div>
              )}

              <Button type="submit" disabled={isSubmitting} className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white">
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Add Property"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
