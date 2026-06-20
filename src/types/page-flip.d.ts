declare module "page-flip" {
  export interface FlipSetting {
    width: number;
    height: number;
    size?: "fixed" | "stretch";
    minWidth?: number;
    maxWidth?: number;
    minHeight?: number;
    maxHeight?: number;
    drawShadow?: boolean;
    flippingTime?: number;
    usePortrait?: boolean;
    startZIndex?: number;
    autoSize?: boolean;
    maxShadowOpacity?: number;
    showCover?: boolean;
    mobileScrollSupport?: boolean;
    swipeDistance?: number;
    clickEventForward?: boolean;
    useMouseEvents?: boolean;
    render?: (page: PageFlipPage) => void;
  }

  export interface PageFlipPage {
    getPageNumber(): number;
    getFlipController(): unknown;
    getElement(): HTMLElement;
    getDensity(): number;
    isLoaded(): boolean;
  }

  export interface PageFlipEvent {
    data: number;
    object: PageFlipPage;
  }

  export type PageFlipEventName =
    | "init"
    | "change"
    | "changeState"
    | "flip"
    | "update"
    | "render"
    | "zoom"
    | "destroy";

  export class PageFlip {
    constructor(parentElement: HTMLElement, settings: FlipSetting);
    loadFromImages(images: string[]): Promise<void>;
    loadFromHtml(items: HTMLElement[]): Promise<void>;
    update(): void;
    flipNext(corner?: "top" | "bottom"): Promise<void>;
    flipPrev(corner?: "top" | "bottom"): Promise<void>;
    flip(pageNum: number, corner?: "top" | "bottom"): Promise<void>;
    turnToNextPage(): void;
    turnToPrevPage(): void;
    turnToPage(pageNum: number): void;
    getPageCount(): number;
    getCurrentPageIndex(): number;
    destroy(): void;
    on(eventName: PageFlipEventName, callback: (e: PageFlipEvent) => void): void;
    off(eventName: PageFlipEventName, callback: (e: PageFlipEvent) => void): void;
  }
}