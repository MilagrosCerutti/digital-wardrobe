import { useState } from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/Tabs';
import { Spinner } from '@/components/Spinner';
import { ErrorState } from '@/components/ErrorState';
import { EmptyState } from '@/components/EmptyState';
import { useToast } from '@/components/Toast';
import { useCatalogQuery, useClosetItemsQuery } from '@/features/closet';
import {
  InspireMeForm,
  RecommendationCard,
  StyleCard,
  useGenerateRecommendationsMutation,
  useSaveRecommendationMutation,
} from '@/features/inspireMe';
import type { InspireMeFormValues, Mood, Recommendation } from '@/features/inspireMe';
import { getApiErrorMessage } from '@/utils/apiError';

type InspireMeMode = 'quick' | 'advanced';

const EMPTY_VALUES: InspireMeFormValues = {
  mood: '',
  occasionId: '',
  formalityLevel: '',
  requiredItemId: '',
  excludedItemIds: [],
  useFavorites: false,
};

interface SubmittedContext {
  mood: Mood;
  occasionId: string;
}

export function InspireMePage() {
  const [mode, setMode] = useState<InspireMeMode>('quick');
  const [values, setValues] = useState<InspireMeFormValues>(EMPTY_VALUES);
  // Frozen at submit time: handleSave must attach the mood/occasion that
  // actually produced the displayed results, not whatever the form
  // currently holds (the user can keep editing the form after generating
  // without resubmitting).
  const [submittedContext, setSubmittedContext] = useState<SubmittedContext | null>(null);
  const [savedIndexes, setSavedIndexes] = useState<Set<number>>(new Set());
  const { toast } = useToast();

  const catalogQuery = useCatalogQuery();
  const itemsQuery = useClosetItemsQuery({});
  const generate = useGenerateRecommendationsMutation();
  const save = useSaveRecommendationMutation();

  function handleSubmit() {
    setSavedIndexes(new Set());
    setSubmittedContext({ mood: values.mood as Mood, occasionId: values.occasionId });
    generate.mutate({
      mood: values.mood as Mood,
      occasionId: values.occasionId,
      formalityLevel: mode === 'advanced' && values.formalityLevel ? values.formalityLevel : undefined,
      requiredItemId: mode === 'advanced' && values.requiredItemId ? values.requiredItemId : undefined,
      excludedItemIds: mode === 'advanced' ? values.excludedItemIds : undefined,
      useFavorites: mode === 'advanced' ? values.useFavorites : undefined,
    });
  }

  async function handleSave(index: number, recommendation: Recommendation) {
    if (!submittedContext) return;
    try {
      await save.mutateAsync({
        clothingItemIds: recommendation.items.map((item) => item.id),
        source: 'GENERATED',
        occasionId: submittedContext.occasionId,
        mood: submittedContext.mood,
      });
      setSavedIndexes((current) => new Set(current).add(index));
      toast({ title: 'Look saved', variant: 'success' });
    } catch (error) {
      toast({ title: 'Could not save this look', description: getApiErrorMessage(error), variant: 'error' });
    }
  }

  return (
    <div className="dw-grain px-5 py-12 sm:px-8">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-8">
        <div>
          <span className="dw-micro text-primary">Inspire Me</span>
          <h1 className="mt-1 text-3xl font-bold text-foreground">Let your closet surprise you.</h1>
          <p className="mt-2 max-w-xl text-sm text-muted-foreground">
            Tell us the mood and occasion — we'll style it from pieces you already own.
          </p>
        </div>

        <Tabs value={mode} onChange={(value) => setMode(value as InspireMeMode)}>
          <TabsList>
            <TabsTrigger value="quick">Quick Mode</TabsTrigger>
            <TabsTrigger value="advanced">Advanced Mode</TabsTrigger>
          </TabsList>
        </Tabs>

        {(catalogQuery.isLoading || itemsQuery.isLoading) && (
          <div className="flex justify-center py-6">
            <Spinner label="Loading your closet" />
          </div>
        )}
        {catalogQuery.isError && (
          <ErrorState
            title="Couldn't load occasions"
            description={getApiErrorMessage(catalogQuery.error)}
            onRetry={() => catalogQuery.refetch()}
          />
        )}
        {itemsQuery.isError && (
          <ErrorState
            title="Couldn't load your closet"
            description={getApiErrorMessage(itemsQuery.error)}
            onRetry={() => itemsQuery.refetch()}
          />
        )}
        {catalogQuery.data && itemsQuery.data && (
          <InspireMeForm
            mode={mode}
            catalog={catalogQuery.data}
            closetItems={itemsQuery.data}
            values={values}
            onChange={setValues}
            onSubmit={handleSubmit}
            isSubmitting={generate.isPending}
          />
        )}

        <div className="flex flex-col gap-6">
          {generate.isPending && (
            <div className="flex justify-center py-6">
              <Spinner label="Styling your look" />
            </div>
          )}
          {generate.isError && (
            <ErrorState
              title="Couldn't generate recommendations"
              description={getApiErrorMessage(generate.error)}
              onRetry={handleSubmit}
            />
          )}
          {generate.isSuccess && generate.data.recommendations.length === 0 && (
            <EmptyState
              title="No looks yet"
              description={
                generate.data.emptyReason === 'BELOW_COMPATIBILITY_FLOOR'
                  ? "We found outfits, but none of them matched well enough together (at least 20% compatibility). Try a different required item, remove an item you're avoiding, or add more colors/styles to that category."
                  : 'Add a few more pieces to your closet so we can build a complete outfit.'
              }
            />
          )}
          {generate.isSuccess && generate.data.styleCard && <StyleCard styleCard={generate.data.styleCard} />}
          {generate.isSuccess && generate.data.recommendations.length > 0 && (
            <div className="grid gap-6 sm:grid-cols-2">
              {generate.data.recommendations.map((recommendation, index) => (
                <RecommendationCard
                  key={index}
                  recommendation={recommendation}
                  onSave={() => handleSave(index, recommendation)}
                  isSaving={save.isPending}
                  isSaved={savedIndexes.has(index)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
