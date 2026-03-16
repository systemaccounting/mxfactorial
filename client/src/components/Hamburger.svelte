<script lang="ts">
	interface Props {
		isOpen: boolean;
		toggle: () => void;
		theme?: 'surface' | 'flat';
	}
	let { isOpen, toggle, theme = 'surface' }: Props = $props();

	function handleClick(e: MouseEvent): void {
		e.preventDefault();
		e.stopPropagation();
		toggle();
	}
</script>

<button onclick={handleClick} aria-label="menu" class={theme}>
	<span class="first {isOpen ? 'first-active' : ''}"></span>
	<span class="second {isOpen ? 'second-active' : ''}"></span>
	<span class="third {isOpen ? 'third-active' : ''}"></span>
</button>

<style>
	button {
		position: fixed;
		width: 64px;
		height: 64px;
		border-radius: 50%;
		outline: none;
		padding: 0;
		z-index: 1000;
		right: 1.5rem;
		bottom: 1rem;
		background-color: var(--color-primary);
		border-color: transparent;
	}
	button.flat {
		background-color: white;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);
	}
	button.flat span {
		background-color: #333;
	}
	button:focus {
		outline: none;
	}
	span {
		position: absolute;
		width: 40px;
		height: 4px;
		left: 10px;
		border-radius: 2px;
		background-color: var(--color-white);
		opacity: 1;
		transition: 0.2s;
	}
	.first {
		top: 18px;
	}
	.first-active {
		top: 28px;
		transform: rotate(45deg);
	}
	.second {
		top: 28px;
	}
	.second-active {
		opacity: 0;
	}
	.third {
		top: 38px;
	}
	.third-active {
		top: 29px;
		transform: rotate(-45deg);
	}
</style>
