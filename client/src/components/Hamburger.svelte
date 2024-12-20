<script lang="ts">
	import { activeNav, switchActiveNav } from '../stores/activeNav';
	function handleClick(e: MouseEvent): void {
		e.preventDefault();
		switchActiveNav();
	}
	let isNavActive: boolean;
	activeNav.subscribe((value) => {
		isNavActive = value;
	});
</script>
<!-- svelte-ignore a11y_consider_explicit_label -->
<button onclick={handleClick}>
	<span class="first {isNavActive ? 'first-active' : ''}"></span>
	<span class="second {isNavActive ? 'second-active' : ''}"></span>
	<span class="third {isNavActive ? 'third-active' : ''}"></span>
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
		background-color: #005396;
		border-color: transparent;
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
		background-color: white;
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
