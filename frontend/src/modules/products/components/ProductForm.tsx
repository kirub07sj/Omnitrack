//@ts-nocheck
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
// import { productSchema, ProductFormData } from "../schemas/product.schema";
import * as z from "zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Upload } from "lucide-react";

// Placeholder schema until foundation agent finishes
const tempSchema = z.object({
  name: z.string().min(2),
  categoryId: z.string().min(1),
  description: z.string().optional(),
  price: z.coerce.number().min(0),
  unit: z.string().min(1),
  trackInventory: z.boolean().default(false),
  minStock: z.coerce.number().min(0).optional(),
  imageUrl: z.string().optional(),
  status: z.enum(["Active", "Inactive"]),
});

interface Props {
  initialData?: any;
  onSubmit: (data: any) => void;
  isLoading?: boolean;
  onCancel?: () => void;
  categories: any[];
}

export function ProductForm({ initialData, onSubmit, isLoading, onCancel, categories }: Props) {
  const form = useForm<z.infer<typeof tempSchema>>({
    resolver: zodResolver(tempSchema) as any,
    defaultValues: {
      name: initialData?.name || "",
      categoryId: initialData?.categoryId || "",
      description: initialData?.description || "",
      price: initialData?.price || 0,
      unit: initialData?.unit || "Piece",
      trackInventory: initialData?.trackInventory || false,
      minStock: initialData?.minStock || 0,
      imageUrl: initialData?.imageUrl || "",
      status: initialData?.status || "Active",
    },
  });

  const trackInventory = form.watch("trackInventory");

  useEffect(() => {
    if (initialData) {
      form.reset({
        name: initialData.name || "",
        categoryId: initialData.categoryId || "",
        description: initialData.description || "",
        price: initialData.price || 0,
        unit: initialData.unit || "Piece",
        trackInventory: initialData.trackInventory || false,
        minStock: initialData.minStock || 0,
        imageUrl: initialData.imageUrl || "",
        status: initialData.status || "Active",
      });
    }
  }, [initialData, form]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg">Product Information</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Side: Text Inputs */}
            <div className="lg:col-span-2 space-y-6">
              <FormField
                control={form.control as any}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Avocado Toast" {...field} className="bg-background border-border" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control as any}
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category *</FormLabel>
                    <div className="flex gap-2">
                      <Select onValueChange={field.onChange} value={field.value || undefined}>
                        <FormControl>
                          <SelectTrigger className="bg-background border-border flex-1">
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map(c => (
                            <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button type="button" variant="outline" className="border-border">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control as any}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Detailed product description..." {...field} className="bg-background border-border min-h-[100px]" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Right Side: Image Upload */}
            <div className="lg:col-span-1">
              <FormField
                control={form.control as any}
                name="imageUrl"
                render={({ field }) => (
                  <FormItem className="flex flex-col h-full">
                    <FormLabel>Product Image (Optional)</FormLabel>
                    <div className="flex-1 mt-1 border-2 border-dashed border-border rounded-xl bg-muted/30 flex flex-col items-center justify-center p-4 relative overflow-hidden transition-colors hover:bg-muted/50 min-h-[200px]">
                      {field.value ? (
                        <div className="relative w-full h-full flex flex-col items-center justify-center">
                          <img 
                            src={field.value} 
                            alt="Preview" 
                            className="max-h-[200px] w-auto max-w-full object-contain rounded-md shadow-sm mb-4"
                          />
                          <Button 
                            type="button" 
                            variant="destructive" 
                            size="sm" 
                            className="w-full"
                            onClick={() => field.onChange("")}
                          >
                            Remove Image
                          </Button>
                        </div>
                      ) : (
                        <div className="text-center space-y-4 py-8">
                          <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
                            <Upload className="h-6 w-6" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-foreground">Upload Image</p>
                            <p className="text-xs text-muted-foreground mt-1">PNG, JPG up to 5MB</p>
                          </div>
                          <div className="relative inline-block">
                            <Button type="button" variant="outline" size="sm" className="relative z-0 border-border">
                              Choose File
                            </Button>
                            <Input 
                              type="file" 
                              accept="image/*" 
                              className="absolute inset-0 opacity-0 cursor-pointer z-10 w-full h-full" 
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const url = URL.createObjectURL(file);
                                  field.onChange(url);
                                }
                              }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg">Pricing & Units</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control as any}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Selling Price (ETB) *</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" {...field} className="bg-background border-border [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control as any}
              name="unit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Unit *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value || undefined}>
                    <FormControl>
                      <SelectTrigger className="bg-background border-border">
                        <SelectValue placeholder="Select unit" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Piece">Piece</SelectItem>
                      <SelectItem value="Bottle">Bottle</SelectItem>
                      <SelectItem value="Kg">Kg</SelectItem>
                      <SelectItem value="Gram">Gram</SelectItem>
                      <SelectItem value="Liter">Liter</SelectItem>
                      <SelectItem value="Box">Box</SelectItem>
                      <SelectItem value="Packet">Packet</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg">Inventory & Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <FormField
              control={form.control as any}
              name="trackInventory"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 p-4 border border-border rounded-md bg-background">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Track Inventory</FormLabel>
                    <FormDescription>
                      Enable tracking to monitor stock levels and get low stock alerts.
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />

            {trackInventory && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                <FormField
                  control={form.control as any}
                  name="minStock"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Minimum Stock Level</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} className="bg-background border-border" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            <div className="pt-4 max-w-sm">
              <FormField
                control={form.control as any}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || undefined}>
                      <FormControl>
                        <SelectTrigger className="bg-background border-border">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="Inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Form Actions */}
        <div className="flex items-center justify-end gap-4 pt-4">
          <Button type="button" variant="outline" onClick={onCancel} className="border-border">
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading} className="bg-emerald-600 hover:bg-emerald-700 text-white min-w-[120px]">
            {isLoading ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
