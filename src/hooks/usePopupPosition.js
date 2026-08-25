import {
    useCallback,
    useEffect,
    useRef,
    useState
} from "react";

function usePopupPosition(
    isOpen,
    setIsOpen,
    options = {}
) {
    const {
        spacing = 5,
        preferAbove = false,
    } = options;

    const triggerRef = useRef(null);
    const menuRef = useRef(null);

    const [position, setPosition] = useState({
        top: 0,
        left: 0,
    });

    const updatePosition = useCallback(() => {
        const trigger = triggerRef.current;
        const menu = menuRef.current;

        if (!trigger || !menu) return;

        const triggerRect =
            trigger.getBoundingClientRect();

        const menuRect =
            menu.getBoundingClientRect();

        const viewportWidth =
            window.innerWidth;

        const viewportHeight =
            window.innerHeight;

        const spaceBelow =
            viewportHeight -
            triggerRect.bottom;

        const spaceAbove =
            triggerRect.top;

        const menuHeight =
            menuRect.height;

        const menuWidth =
            menuRect.width;

        /*
         * Vertical positioning
         */

        const shouldOpenUp = preferAbove
            ? spaceAbove >= menuHeight + spacing
            : spaceBelow < menuHeight + spacing &&
            spaceAbove >= menuHeight + spacing;

        let top = shouldOpenUp
            ? triggerRect.top -
            menuHeight -
            spacing
            : triggerRect.bottom +
            spacing;

        /*
         * Horizontal positioning
         */

        let left = triggerRect.left;

        if (
            left + menuWidth >
            viewportWidth
        ) {
            left =
                viewportWidth -
                menuWidth -
                spacing;
        }

        if (left < spacing) {
            left = spacing;
        }

        /*
         * Vertical boundary protection
         */

        if (
            top + menuHeight >
            viewportHeight - spacing
        ) {
            top =
                viewportHeight -
                menuHeight -
                spacing;
        }

        if (top < spacing) {
            top = spacing;
        }

        setPosition({
            top,
            left,
        });
    }, [spacing]);

    /*
     * Position menu
     */

    useEffect(() => {
        if (!isOpen) return;

        updatePosition();

        const handleResize = () => {
            updatePosition();
        };

        window.addEventListener(
            "resize",
            handleResize
        );

        return () => {
            window.removeEventListener(
                "resize",
                handleResize
            );
        };
    }, [isOpen, updatePosition]);

    /*
     * Close menu
     * when clicking outside
     * or pressing Escape
     */

    useEffect(() => {
        if (!isOpen) return;

        const handleClickOutside = (event) => {
            if (
                menuRef.current &&
                !menuRef.current.contains(
                    event.target
                ) &&
                triggerRef.current &&
                !triggerRef.current.contains(
                    event.target
                )
            ) {
                setIsOpen(false);
            }
        };

        const handleKeyDown = (event) => {
            if (event.key === "Escape") {
                setIsOpen(false);
            }
        };

        document.addEventListener(
            "mousedown",
            handleClickOutside
        );

        document.addEventListener(
            "keydown",
            handleKeyDown
        );

        return () => {
            document.removeEventListener(
                "mousedown",
                handleClickOutside
            );

            document.removeEventListener(
                "keydown",
                handleKeyDown
            );
        };
    }, [isOpen, setIsOpen]);

    return {
        triggerRef,
        menuRef,
        position,
        updatePosition,
    };
}

export default usePopupPosition;