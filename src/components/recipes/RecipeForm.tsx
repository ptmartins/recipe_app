"use client";
import { useState, useRef } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Plus, Trash2, GripVertical, Upload, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { recipeSchema, type RecipeFormData } from "@/lib/validations/recipe.schema";
import { CATEGORIES, UNITS, type IRecipe } from "@/types";
import { getCategoryColor, cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import Image from "next/image";

interface RecipeFormProps {
  recipe?: IRecipe;
}

export function RecipeForm({ recipe }: RecipeFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(recipe?.thumbnail.url ?? null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RecipeFormData>({
    resolver: zodResolver(recipeSchema),
    defaultValues: recipe
      ? {
          title: recipe.title,
          description: recipe.description,
          ingredients: recipe.ingredients,
          steps: recipe.steps,
          estimatedTime: recipe.estimatedTime,
          difficulty: recipe.difficulty,
          categories: recipe.categories,
          servings: recipe.servings,
          tags: recipe.tags,
          suitableFor: recipe.suitableFor,
        }
      : {
          ingredients: [{ name: "", amount: 1, unit: "g" }],
          steps: [{ order: 1, description: "" }],
          estimatedTime: 30,
          difficulty: "easy",
          categories: [],
          servings: 4,
          tags: [],
          suitableFor: ["lunch", "dinner"],
        },
  });

  const { fields: ingredientFields, append: appendIngredient, remove: removeIngredient } = useFieldArray({
    control,
    name: "ingredients",
  });

  const { fields: stepFields, append: appendStep, remove: removeStep } = useFieldArray({
    control,
    name: "steps",
  });

  const watchedCategories = watch("categories");
  const watchedSuitableFor = watch("suitableFor");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setThumbnailFile(file);
    setThumbnailPreview(URL.createObjectURL(file));
  };

  const onSubmit = async (data: RecipeFormData) => {
    if (!recipe && !thumbnailFile) {
      toast({ title: "Photo required", description: "Please add a recipe photo.", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      if (thumbnailFile) formData.append("thumbnail", thumbnailFile);
      formData.append("title", data.title);
      formData.append("description", data.description);
      formData.append("ingredients", JSON.stringify(data.ingredients));
      formData.append("steps", JSON.stringify(data.steps));
      formData.append("estimatedTime", data.estimatedTime.toString());
      formData.append("difficulty", data.difficulty);
      formData.append("categories", JSON.stringify(data.categories));
      formData.append("servings", data.servings.toString());
      formData.append("tags", JSON.stringify(data.tags));
      formData.append("suitableFor", JSON.stringify(data.suitableFor));

      const url = recipe ? `/api/recipes/${recipe._id}` : "/api/recipes";
      const method = recipe ? "PUT" : "POST";

      const res = await fetch(url, { method, body: formData });
      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error ?? "Failed to save recipe");
      }

      toast({ title: recipe ? "Recipe updated!" : "Recipe created!", variant: "success" as "default" });
      router.push(`/recipes/${result.recipe._id}`);
      router.refresh();
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Thumbnail */}
      <div className="space-y-2">
        <Label>Recipe Photo *</Label>
        <div
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            "relative aspect-[16/7] rounded-2xl border-2 border-dashed cursor-pointer overflow-hidden bg-muted/50 hover:bg-muted transition-colors",
            thumbnailPreview ? "border-transparent" : "border-border hover:border-primary/40"
          )}
        >
          {thumbnailPreview ? (
            <Image src={thumbnailPreview} alt="Preview" fill className="object-cover" />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-muted-foreground">
              <Upload className="h-8 w-8" />
              <p className="text-sm font-medium">Click to upload photo</p>
              <p className="text-xs">JPG, PNG, WebP up to 5MB</p>
            </div>
          )}
          {thumbnailPreview && (
            <div className="absolute inset-0 bg-black/30 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
              <span className="text-white text-sm font-medium">Change photo</span>
            </div>
          )}
        </div>
        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
      </div>

      {/* Title & Description */}
      <div className="grid gap-6 sm:grid-cols-2">
        <div className="sm:col-span-2 space-y-2">
          <Label htmlFor="title">Title *</Label>
          <Input id="title" placeholder="e.g. Creamy Mushroom Risotto" {...register("title")} />
          {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
        </div>
        <div className="sm:col-span-2 space-y-2">
          <Label htmlFor="description">Description *</Label>
          <Textarea
            id="description"
            placeholder="Brief description of the recipe..."
            rows={3}
            {...register("description")}
          />
          {errors.description && <p className="text-xs text-destructive">{errors.description.message}</p>}
        </div>
      </div>

      {/* Meta */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="estimatedTime">Time (minutes) *</Label>
          <Input
            id="estimatedTime"
            type="number"
            min={1}
            {...register("estimatedTime", { valueAsNumber: true })}
          />
          {errors.estimatedTime && <p className="text-xs text-destructive">{errors.estimatedTime.message}</p>}
        </div>
        <div className="space-y-2">
          <Label>Difficulty *</Label>
          <Controller
            control={control}
            name="difficulty"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="servings">Servings *</Label>
          <Input
            id="servings"
            type="number"
            min={1}
            {...register("servings", { valueAsNumber: true })}
          />
        </div>
      </div>

      {/* Categories */}
      <div className="space-y-2">
        <Label>Categories * <span className="text-xs text-muted-foreground">(select all that apply)</span></Label>
        <Controller
          control={control}
          name="categories"
          render={({ field }) => (
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => {
                const selected = field.value.includes(cat);
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => {
                      field.onChange(
                        selected ? field.value.filter((c) => c !== cat) : [...field.value, cat]
                      );
                    }}
                    className={cn(
                      "px-3 py-1.5 rounded-full text-xs font-medium border transition-all",
                      selected
                        ? cn(getCategoryColor(cat), "border-current ring-1 ring-current/20")
                        : "border-border hover:border-primary/30 bg-background hover:bg-muted"
                    )}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          )}
        />
        {errors.categories && <p className="text-xs text-destructive">{errors.categories.message}</p>}
      </div>

      {/* Suitable for */}
      <div className="space-y-2">
        <Label>Suitable for * <span className="text-xs text-muted-foreground">(used for menu planning)</span></Label>
        <Controller
          control={control}
          name="suitableFor"
          render={({ field }) => (
            <div className="flex gap-4">
              {(["breakfast", "lunch", "dinner"] as const).map((meal) => (
                <label key={meal} className="flex items-center gap-2 cursor-pointer">
                  <Checkbox
                    checked={field.value.includes(meal)}
                    onCheckedChange={(checked) => {
                      field.onChange(
                        checked ? [...field.value, meal] : field.value.filter((m) => m !== meal)
                      );
                    }}
                  />
                  <span className="text-sm capitalize">{meal}</span>
                </label>
              ))}
            </div>
          )}
        />
        {errors.suitableFor && <p className="text-xs text-destructive">{errors.suitableFor.message}</p>}
      </div>

      {/* Tags */}
      <div className="space-y-2">
        <Label>Tags <span className="text-xs text-muted-foreground">(comma-separated)</span></Label>
        <Controller
          control={control}
          name="tags"
          render={({ field }) => (
            <Input
              placeholder="e.g. quick, healthy, gluten-free"
              value={field.value.join(", ")}
              onChange={(e) =>
                field.onChange(
                  e.target.value.split(",").map((t) => t.trim()).filter(Boolean)
                )
              }
            />
          )}
        />
      </div>

      {/* Ingredients */}
      <div className="space-y-3">
        <Label>Ingredients *</Label>
        <div className="space-y-2">
          {ingredientFields.map((field, i) => (
            <div key={field.id} className="flex items-center gap-2">
              <GripVertical className="h-4 w-4 text-muted-foreground shrink-0" />
              <Input
                placeholder="Ingredient name"
                className="flex-1"
                {...register(`ingredients.${i}.name`)}
              />
              <Input
                type="number"
                step="0.01"
                placeholder="Amount"
                className="w-24"
                {...register(`ingredients.${i}.amount`, { valueAsNumber: true })}
              />
              <Controller
                control={control}
                name={`ingredients.${i}.unit`}
                render={({ field: unitField }) => (
                  <Select value={unitField.value} onValueChange={unitField.onChange}>
                    <SelectTrigger className="w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {UNITS.map((u) => (
                        <SelectItem key={u} value={u}>{u}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeIngredient(i)}
                disabled={ingredientFields.length <= 1}
                className="shrink-0 h-9 w-9 text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => appendIngredient({ name: "", amount: 1, unit: "g" })}
        >
          <Plus className="h-4 w-4 mr-1" />
          Add Ingredient
        </Button>
        {errors.ingredients && (
          <p className="text-xs text-destructive">{errors.ingredients.message ?? errors.ingredients.root?.message}</p>
        )}
      </div>

      {/* Steps */}
      <div className="space-y-3">
        <Label>Preparation Steps *</Label>
        <div className="space-y-3">
          {stepFields.map((field, i) => (
            <div key={field.id} className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-semibold mt-1">
                {i + 1}
              </div>
              <Textarea
                placeholder={`Step ${i + 1}...`}
                rows={2}
                className="flex-1"
                {...register(`steps.${i}.description`)}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeStep(i)}
                disabled={stepFields.length <= 1}
                className="shrink-0 mt-1 text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => appendStep({ order: stepFields.length + 1, description: "" })}
        >
          <Plus className="h-4 w-4 mr-1" />
          Add Step
        </Button>
      </div>

      {/* Submit */}
      <div className="flex gap-3 pt-4 border-t">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting} className="flex-1">
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              {recipe ? "Updating..." : "Creating..."}
            </>
          ) : (
            recipe ? "Update Recipe" : "Create Recipe"
          )}
        </Button>
      </div>

      {/* Suppress unused var warning */}
      <div className="hidden">{watchedCategories.length} {watchedSuitableFor.length}</div>
    </form>
  );
}
