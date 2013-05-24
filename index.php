<!doctype html>
<html>
<head>
  <?php include 'includes/_meta.php'; ?>
</head>
<body>
<header class="header">
  <?php include 'includes/_siteTitle.php'; ?>
	<div class="data-entry">
		<input type="url" class="url-entry input-large" placeholder="Enter Website URL To Resize" />
		<button class="btn btn-start" title="For best results maximize your browser first"><span>S</span>tart</button>
		<a href="about.php" class="btn button-help" title="Help &amp; About Resizive">?</a>
		<button class="btn btn-pause"><span>P</span>ause</button>
		<span class="show-width" contenteditable title="Set A Specific Width (PX)"></span>
		<button class="btn btn-minus">&laquo; <span>-</span>10</button>
		<button class="btn btn-plus"><span>+</span>10 &raquo;</button>
	</div>
</header>
<img src="images/loading.gif" width="32" height="32" alt="Loading" class="loading" />
<?php include 'includes/_scripts.php'; ?>
<?php include 'includes/_ga.php'; ?>
</body>
</html>

