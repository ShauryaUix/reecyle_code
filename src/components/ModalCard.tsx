import React, {
	cloneElement,
	useRef,
	useMemo,
	useEffect,
	ReactElement,
} from 'react';
import ReactDOM from 'react-dom';
import styled, { css } from 'styled-components';
import {
	motion,
	AnimatePresence,
	useElementScroll,
	useTransform,
} from 'framer-motion';

type BackDropProps = {
	color?: string | string[];
	blur?: boolean;
};

export const BackDrop = styled(motion.div)<BackDropProps>`
	position: fixed;
	top: 0px;
	bottom: 0px;
	left: 0px;
	right: 0px;
	background: ${({ color }) =>
		typeof color === 'object'
			? `linear-gradient(to right, ${color[0]}, ${color[1]})`
			: color};
	z-index: 9999999999;
	${({ blur }) =>
		blur === true &&
		css`
			backdrop-filter: blur(5px);
		`}
`;

BackDrop.defaultProps = {
	color: 'rgba(0, 0, 0, 0.4)',
	blur: true,
};

export const Wrapper = styled(motion.div)`
	display: block;
	position: absolute;
	top: 0px;
	bottom: 0px;
	left: 0px;
	right: 0px;
	overflow-x: visible;
	overflow-y: scroll;
	display: flex;
	flex-direction: column;
	align-items: center;
	padding-bottom: 1500px;
	margin-bottom: -1500px;
	z-index: 9999999999;

	&::-webkit-scrollbar {
		display: none;
	}
`;

export const Scroller = styled.div`
	display: flex;
	flex-direction: column;
	align-items: center;
	width: 100%;
	height: calc(100% + 1px);
	flex-shrink: 0;
	overflow: visible;
`;

export const SpacerWrapper = styled(motion.div)`
	display: flex;
	flex: 1;
	align-items: center;
	width: 100%;
	pointer-events: none;
`;

type SpacerProps = {
	minHeight: string;
};

export const Spacer = styled.div<SpacerProps>`
	display: flex;
	flex: 1;
	min-height: ${({ minHeight }) => minHeight};
	width: 100%;
	pointer-events: none;
`;

export const Card = styled.div`
	display: flex;
	position: relative;
	flex-direction: column;
	flex-shrink: 0;
	background-color: white;
	padding: 25px;
	width: 100%;
	max-width: 400px;
	border-top-left-radius: 25px;
	border-top-right-radius: 25px;
	box-shadow: 0 0 30px rgba(0, 0, 0, 0.2);
	pointer-events: initial;
`;

export const CardOverscroll = styled.div`
	position: absolute;
	width: 100%;
	height: 1500px;
	bottom: -1500px;
	pointer-events: none;
	left: 0px;
	background-color: white;
`;

type WrapperWithAnimationProps = {
	id: string;
	className?: string;
	touchRef: React.MutableRefObject<{
		cache: number | null;
		velocity: number | null;
	}>;
	wrapperRef: React.MutableRefObject<HTMLDivElement | null>;
	scrollerRef: React.MutableRefObject<HTMLDivElement | null>;
	onPullDown?: () => void;
	onBackdropClick?: () => void;
	ComponentSpacer: React.ComponentType<{ minHeight: string }>;
	spacerHeight: string;
	spacerWrapperProps: object;
	wrapperProps: object;
	children?: React.ReactNode;
};

const WrapperWithAnimation: React.FC<WrapperWithAnimationProps> = ({
	id,
	className,
	touchRef,
	scrollerRef,
	wrapperRef,
	onPullDown,
	onBackdropClick,
	ComponentSpacer,
	spacerHeight,
	spacerWrapperProps,
	wrapperProps,
	children,
}) => {
	const { scrollY } = useElementScroll(wrapperRef);
	const y = useTransform(scrollY, [-300, 0, 300], [-100, 0, 100]);
	const opacity = useTransform(scrollY, [0, 300], [1, 0.7]);

	return (
		<Wrapper
			key={id}
			ref={wrapperRef}
			initial={{ y: '150vh' }}
			animate={{ y: '1px' }}
			exit={{ y: '150vh' }}
			transition={{
				type: 'spring',
				stiffness: 100,
				damping: 13,
				mass: 1,
			}}
			className={className}
			onTouchMove={(event) => {
				const { current: touch } = touchRef;
				const { screenY: value } = event.touches[0];
				if (touch.cache !== null) {
					touch.velocity = value - touch.cache;
				}
				touch.cache = value;
			}}
			onTouchEnd={(event) => {
				if (
					onPullDown &&
					((wrapperRef.current && wrapperRef.current.scrollTop < -90) ||
						touchRef.current.velocity || 21 > 20) //fix here
				) {
					onPullDown();
				}
				touchRef.current.cache = null;
				touchRef.current.velocity = null;
			}}
			onClick={(event) => {
				if (
					event.target === wrapperRef.current ||
					event.target === scrollerRef.current
				) {
					onBackdropClick && onBackdropClick();
				}
			}}
			{...wrapperProps}
		>
			<Scroller ref={scrollerRef}>
				<AnimatePresence>
					<SpacerWrapper
						initial={{ opacity: 0, y: '100%' }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: '100%' }}
						transition={{
							type: 'spring',
							stiffness: 90,
							damping: 12,
							mass: 1,
							delay: 0.2,
						}}
						{...spacerWrapperProps}
					>
						<motion.div style={{ y, opacity, width: '100%' }}>
							<ComponentSpacer minHeight={spacerHeight} />
						</motion.div>
					</SpacerWrapper>
				</AnimatePresence>
				<Card>{children}</Card>
			</Scroller>
		</Wrapper>
	);
};

type ModalCardProps = {
	id?: string;
	children?: React.ReactNode;
	className?: string;
	onPullDown?: () => void;
	onBackdropClick?: () => void;
	wrapperProps?: object;
	backdrop?: ReactElement;
	backdropColor?: string | string[];
	backdropOpacity?: number;
	backdropBlur?: boolean;
	backdropProps?: object;
	ComponentBackDrop?: React.ComponentType<BackDropProps>;
	spacerHeight?: string;
	spacerWrapperProps?: object;
	ComponentSpacer?: React.ComponentType<{ minHeight: string }>;
	appendToBody?: boolean;
};

const ModalCard: React.FC<ModalCardProps> = ({
	id = 'card',
	children,
	className,
	onPullDown,
	onBackdropClick,
	wrapperProps = {},
	backdrop = null,
	backdropColor,
	backdropOpacity = 1,
	backdropBlur = true,
	backdropProps = {},
	ComponentBackDrop = BackDrop,
	spacerHeight = '30vh',
	spacerWrapperProps = {},
	ComponentSpacer = Spacer,
	appendToBody = true,
}) => {
	const touchRef = useRef<{ cache: number | null; velocity: number | null }>({
		cache: null,
		velocity: null,
	});
	const wrapperRef = useRef<HTMLDivElement | null>(null);
	const scrollerRef = useRef<HTMLDivElement | null>(null);
	const portalDom = useMemo(() => {
		if (appendToBody) {
			const element = document.createElement('div');
			document.body.appendChild(element);
			return element;
		}
		return undefined;
	}, [appendToBody]);

	useEffect(() => {
		return () => {
			if (portalDom) {
				document.body.removeChild(portalDom);
			}
		};
	}, [portalDom]);

	const backdropPropsFinal = {
		key: 'backdrop',
		color: backdropColor,
		blur: backdropBlur,
		initial: { opacity: 0 },
		animate: { opacity: backdropOpacity },
		exit: { opacity: 0 },
		transition: {
			type: 'spring',
			stiffness: 100,
			damping: 13,
			mass: 1,
		},
		...backdropProps,
	};

	const render = (
		<>
			<AnimatePresence>
				{children ? (
					backdrop ? (
						cloneElement(backdrop, backdropPropsFinal)
					) : (
						<ComponentBackDrop
							{...backdropPropsFinal}
						/>
					)
				) : null}
			</AnimatePresence>
			<AnimatePresence exitBeforeEnter>
				{children ? (
					<WrapperWithAnimation
						key={id}
						id={id}
						className={className}
						wrapperRef={wrapperRef}
						onPullDown={onPullDown}
						onBackdropClick={onBackdropClick}
						wrapperProps={wrapperProps}
						spacerHeight={spacerHeight}
						spacerWrapperProps={spacerWrapperProps}
						ComponentSpacer={ComponentSpacer}
						touchRef={touchRef}
						scrollerRef={scrollerRef}
					>
						{children}
					</WrapperWithAnimation>
				) : null}
			</AnimatePresence>
		</>
	);

	if (appendToBody) {
		return ReactDOM.createPortal(render, portalDom!);
	}
	return render;
};

export default ModalCard;
