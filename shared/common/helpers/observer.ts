export type ObserveIntersectionOptions = IntersectionObserverInit & {
    once?: boolean;
};

export const observeIntersection = (
    target: Element | null,
    onIntersect: (entry: IntersectionObserverEntry, observer: IntersectionObserver) => void,
    options?: ObserveIntersectionOptions
) => {
    if (!target || typeof IntersectionObserver === "undefined") {
        return () => undefined;
    }

    const { once, ...observerOptions } = options ?? {};
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            onIntersect(entry, observer);
            if (once) {
                observer.disconnect();
            }
        });
    }, observerOptions);

    observer.observe(target);
    return () => observer.disconnect();
};

