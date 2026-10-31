<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Project rules
- All keynote text, numbers, chart data, build-step counts, capture slots and speaker notes live in `src/content/slides.ts`; components only read from it, so real data replaces sample data without touching components.
- Slides render on a fixed 1920×1080 canvas (`ScaledStage`) and are registered in `src/components/deck/registry.tsx`; `StaticContext` renders final states with no motion for thumbnails, presenter and `/print`.
- Navigation logic is pure in `src/lib/deck-nav.ts` (covered by `src/test/deck-nav.test.ts`); URL `?slide=&step=` is the source of truth for position.
