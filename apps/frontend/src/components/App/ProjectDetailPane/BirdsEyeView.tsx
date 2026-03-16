export function BirdsEyeView({ isDetailOpen }: { isDetailOpen: boolean }) {
  return (
    <div
      className={`
        project-detail-layer 
        birds-eye-view
      `}
      aria-hidden={isDetailOpen}
    >
      <div className="panel project-detail-surface">
        <div className="project-detail-scroll">
          <section data-testid="birds-eye-view">
            <h2 className="panel-title" data-testid="birds-eye-title">
              Birds-Eye View
            </h2>
            <div className="detail-block" data-testid="birds-eye-content">
              <p className="detail-text">No project selected.</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
