"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  animalFormSchema,
  type AnimalFormValues,
} from "@/lib/validations/animal";
import { createAnimal } from "@/actions/animals";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

type Room = {
  id: string;
  identifier: string;
  stage_id: string;
};

type Stage = {
  id: string;
  name: string;
  display_name: string;
};

type AnimalFormProps = {
  rooms: Room[];
  stages: Stage[];
};

export function AnimalForm({ rooms, stages }: AnimalFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<AnimalFormValues>({
    resolver: zodResolver(animalFormSchema),
    defaultValues: {
      animal_id: "",
      category: undefined,
      incoming_company: "",
      entry_date: new Date().toISOString().split("T")[0],
      old_calf_number: "",
      entry_weight: undefined,
      age_months: undefined,
      purchase_price: undefined,
      initial_room_id: "",
      initial_stage_id: "",
    },
  });

  // Filter rooms based on selected stage
  const selectedStageId = form.watch("initial_stage_id");
  const availableRooms = rooms.filter(
    (room) => room.stage_id === selectedStageId
  );

  async function onSubmit(data: AnimalFormValues) {
    setIsSubmitting(true);
    try {
      const result = await createAnimal(data);

      if (result.error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.error,
        });
      } else {
        toast({
          title: "Success",
          description: `Animal ${data.animal_id} registered successfully!`,
        });
        form.reset();
        router.push(`/animals/${data.animal_id}`);
        router.refresh();
      }
    } catch {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Something went wrong. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4 sm:space-y-6 lg:space-y-8"
      >
        {/* Basic Information Section */}
        <div className="space-y-3 sm:space-y-4">
          <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-gray-900 border-b pb-2">
            Basic Information
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
            {/* Animal ID */}
            <FormField
              control={form.control}
              name="animal_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs sm:text-sm font-medium">
                    Animal ID *
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="A123"
                      {...field}
                      className="h-9 sm:h-10 text-xs sm:text-sm"
                    />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            {/* Category */}
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs sm:text-sm font-medium">
                    Category *
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="h-9 sm:h-10 text-xs sm:text-sm">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="beef">Beef</SelectItem>
                      <SelectItem value="camel">Camel</SelectItem>
                      <SelectItem value="sheep">Sheep</SelectItem>
                      <SelectItem value="goat">Goat</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            {/* Entry Date */}
            <FormField
              control={form.control}
              name="entry_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs sm:text-sm font-medium">
                    Entry Date *
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      {...field}
                      className="h-9 sm:h-10 text-xs sm:text-sm"
                    />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            {/* Age */}
            <FormField
              control={form.control}
              name="age_months"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs sm:text-sm font-medium">
                    Age (months)
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="0"
                      value={field.value ?? ""}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value === ""
                            ? undefined
                            : parseFloat(e.target.value)
                        )
                      }
                      onBlur={field.onBlur}
                      name={field.name}
                      className="h-9 sm:h-10 text-xs sm:text-sm"
                    />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Origin & Financial Information Section */}
        <div className="space-y-3 sm:space-y-4">
          <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-gray-900 border-b pb-2">
            Origin & Financial Information
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
            {/* Incoming Company */}
            <FormField
              control={form.control}
              name="incoming_company"
              render={({ field }) => (
                <FormItem className="sm:col-span-1 lg:col-span-1">
                  <FormLabel className="text-xs sm:text-sm font-medium">
                    Incoming Company
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Company name"
                      {...field}
                      className="h-9 sm:h-10 text-xs sm:text-sm"
                    />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            {/* Old Calf Number */}
            <FormField
              control={form.control}
              name="old_calf_number"
              render={({ field }) => (
                <FormItem className="sm:col-span-1 lg:col-span-1">
                  <FormLabel className="text-xs sm:text-sm font-medium">
                    Origin ID
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Origin company ID"
                      {...field}
                      className="h-9 sm:h-10 text-xs sm:text-sm"
                    />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            {/* Purchase Price */}
            <FormField
              control={form.control}
              name="purchase_price"
              render={({ field }) => (
                <FormItem className="sm:col-span-2 lg:col-span-1">
                  <FormLabel className="text-xs sm:text-sm font-medium">
                    Purchase Price
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={field.value ?? ""}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value === ""
                            ? undefined
                            : parseFloat(e.target.value)
                        )
                      }
                      onBlur={field.onBlur}
                      name={field.name}
                      className="h-9 sm:h-10 text-xs sm:text-sm"
                    />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Location & Physical Details Section */}
        <div className="space-y-3 sm:space-y-4">
          <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-gray-900 border-b pb-2">
            Location & Physical Details
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
            {/* Stage */}
            <FormField
              control={form.control}
              name="initial_stage_id"
              render={({ field }) => (
                <FormItem className="sm:col-span-1 lg:col-span-1">
                  <FormLabel className="text-xs sm:text-sm font-medium">
                    Initial Stage *
                  </FormLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value);
                      // Reset room selection when stage changes
                      form.setValue("initial_room_id", "");
                    }}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="h-9 sm:h-10 text-xs sm:text-sm">
                        <SelectValue placeholder="Select stage" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent 
                      className="max-h-[200px] z-50"
                      position="popper"
                      side="bottom"
                      align="start"
                      sideOffset={8}
                      avoidCollisions={false}
                    >
                      {stages.map((stage) => (
                        <SelectItem 
                          key={stage.id} 
                          value={stage.id}
                        >
                          {stage.display_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            {/* Room */}
            <FormField
              control={form.control}
              name="initial_room_id"
              render={({ field }) => (
                <FormItem className="sm:col-span-1 lg:col-span-1">
                  <FormLabel className="text-xs sm:text-sm font-medium">
                    Initial Room *
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={!selectedStageId}
                  >
                    <FormControl>
                      <SelectTrigger className="h-9 sm:h-10 text-xs sm:text-sm">
                        <SelectValue placeholder="Select room" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent 
                      className="max-h-[200px] z-50"
                      position="popper"
                      side="bottom"
                      align="start"
                      sideOffset={8}
                      avoidCollisions={false}
                    >
                      {availableRooms.length > 0 ? (
                        availableRooms.map((room) => (
                          <SelectItem 
                            key={room.id} 
                            value={room.id}
                          >
                            Room {room.identifier}
                          </SelectItem>
                        ))
                      ) : (
                        <div className="px-2 py-1.5 text-xs sm:text-sm text-gray-500">
                          No rooms available for this stage
                        </div>
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            {/* Entry Weight */}
            <FormField
              control={form.control}
              name="entry_weight"
              render={({ field }) => (
                <FormItem className="sm:col-span-2 lg:col-span-1">
                  <FormLabel className="text-xs sm:text-sm font-medium">
                    Entry Weight (kg)
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={field.value ?? ""}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value === ""
                            ? undefined
                            : parseFloat(e.target.value)
                        )
                      }
                      onBlur={field.onBlur}
                      name={field.name}
                      className="h-9 sm:h-10 text-xs sm:text-sm"
                    />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />
          </div>
        </div>





        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4 pt-4 sm:pt-6 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            className="w-full sm:w-auto px-4 sm:px-6 h-9 sm:h-10 text-xs sm:text-sm order-2 sm:order-1"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto px-4 sm:px-6 h-9 sm:h-10 text-xs sm:text-sm order-1 sm:order-2"
          >
            {isSubmitting ? "Registering..." : "Register Animal"}
          </Button>
        </div>
      </form>
    </Form>
  );
}