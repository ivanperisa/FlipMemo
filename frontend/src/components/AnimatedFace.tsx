import { useEffect, useRef, useState } from 'react';

const AnimatedFace = () => {
    const svgRef = useRef<SVGSVGElement>(null);
    const leftPupilRef = useRef<SVGCircleElement>(null);
    const rightPupilRef = useRef<SVGCircleElement>(null);
    const rafIdRef = useRef<number | null>(null);
    
    // Dinamičke boje iz CSS variables
    const [faceColor, setFaceColor] = useState('#F0A2A5');
    const [eyeColor, setEyeColor] = useState('#FFDEE0');
    
    // Učitaj boje iz CSS variables
    useEffect(() => {
        const updateColors = () => {
            const root = getComputedStyle(document.documentElement);
            const face = root.getPropertyValue('--color-face').trim() || '#F0A2A5';
            const eye = root.getPropertyValue('--color-eye').trim() || '#FFDEE0';
            setFaceColor(face);
            setEyeColor(eye);
        };
        
        updateColors();
        
        // MutationObserver za praćenje promjena CSS varijabli
        const observer = new MutationObserver(updateColors);
        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['style']
        });
        
        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        let svgRect: DOMRect | null = null;

        // Cache the SVG bounding rect
        const updateSvgRect = () => {
            if (svgRef.current) {
                svgRect = svgRef.current.getBoundingClientRect();
            }
        };

        updateSvgRect();
        window.addEventListener('resize', updateSvgRect);
        window.addEventListener('scroll', updateSvgRect);

        const handleMouseMove = (e: MouseEvent) => {
            // Cancel previous animation frame if it hasn't executed yet
            if (rafIdRef.current !== null) {
                cancelAnimationFrame(rafIdRef.current);
            }

            // Use requestAnimationFrame for smooth, performance-optimized updates
            rafIdRef.current = requestAnimationFrame(() => {
                if (!svgRect || !leftPupilRef.current || !rightPupilRef.current) return;

                const mouseX = e.clientX;
                const mouseY = e.clientY;

                // Convert mouse position to SVG coordinates
                const svgX = ((mouseX - svgRect.left) / svgRect.width) * 1440;
                const svgY = ((mouseY - svgRect.top) / svgRect.height) * 333;

                // Left eye constraints
                const leftEyeCenter = { x: 512, y: 102 };
                const leftPupilMaxRadius = 28.5; // Keep pupil inside eye socket

                // Calculate direction from left eye center to mouse
                const leftDx = svgX - leftEyeCenter.x;
                const leftDy = svgY - leftEyeCenter.y;
                const leftDistance = Math.sqrt(leftDx * leftDx + leftDy * leftDy);

                // Calculate new pupil position (constrained)
                let newLeftPupilX, newLeftPupilY;
                if (leftDistance > 0) {
                    const constrainedDistance = Math.min(leftDistance, leftPupilMaxRadius);
                    const ratio = constrainedDistance / leftDistance;
                    newLeftPupilX = leftEyeCenter.x + leftDx * ratio;
                    newLeftPupilY = leftEyeCenter.y + leftDy * ratio;
                } else {
                    newLeftPupilX = leftEyeCenter.x;
                    newLeftPupilY = leftEyeCenter.y;
                }

                // Right eye constraints
                const rightEyeCenter = { x: 916, y: 102 };
                const rightPupilMaxRadius = 28.5;

                // Calculate direction from right eye center to mouse
                const rightDx = svgX - rightEyeCenter.x;
                const rightDy = svgY - rightEyeCenter.y;
                const rightDistance = Math.sqrt(rightDx * rightDx + rightDy * rightDy);

                // Calculate new pupil position (constrained)
                let newRightPupilX, newRightPupilY;
                if (rightDistance > 0) {
                    const constrainedDistance = Math.min(rightDistance, rightPupilMaxRadius);
                    const ratio = constrainedDistance / rightDistance;
                    newRightPupilX = rightEyeCenter.x + rightDx * ratio;
                    newRightPupilY = rightEyeCenter.y + rightDy * ratio;
                } else {
                    newRightPupilX = rightEyeCenter.x;
                    newRightPupilY = rightEyeCenter.y;
                }

                // Directly update SVG attributes (no state, no re-renders!)
                leftPupilRef.current.setAttribute('cx', newLeftPupilX.toString());
                leftPupilRef.current.setAttribute('cy', newLeftPupilY.toString());
                rightPupilRef.current.setAttribute('cx', newRightPupilX.toString());
                rightPupilRef.current.setAttribute('cy', newRightPupilY.toString());
            });
        };

        window.addEventListener('mousemove', handleMouseMove);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('resize', updateSvgRect);
            window.removeEventListener('scroll', updateSvgRect);
            if (rafIdRef.current !== null) {
                cancelAnimationFrame(rafIdRef.current);
            }
        };
    }, []);

    return (
        <svg
            ref={svgRef}
            width="1440"
            height="333"
            viewBox="0 0 1440 333"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1080px] h-auto opacity-100"
            style={{ minWidth: '50%' }}
        >
            <ellipse cx="720" cy="-65.5" rx="720" ry="398.5" fill={faceColor} />

            {/* Left Eye */}
            <circle cx="512" cy="102" r="75" fill={eyeColor} />
            <circle
                ref={leftPupilRef}
                cx="511.5"
                cy="101.5"
                r="46.5"
                fill={faceColor}
            />

            {/* Right Eye */}
            <circle cx="916" cy="102" r="75" fill={eyeColor} />
            <circle
                ref={rightPupilRef}
                cx="915.5"
                cy="101.5"
                r="46.5"
                fill={faceColor}
            />

            {/* Mouth */}
            <path
                d="M665.501 178.325C665.501 178.325 685.798 217.858 719.001 218.325C752.204 218.791 769.501 178.325 769.501 178.325"
                stroke={eyeColor}
                strokeWidth="30"
            />
        </svg>
    );
};

export default AnimatedFace;
