<!doctype html>
<html>
<head>
  <?php include 'includes/_meta.php'; ?>
</head>
<body>
<header class="header">
  <?php include 'includes/_siteTitle.php'; ?>
</header>
<div class="desc">
    <p>Resizive aims to improve finding media query breakpoints for responsively designed fluid websites by making the process sane and easy. No built in presets for device widths exist; there are simply too many devices in too many sizes for breakpoints based upon device widths to make any rational sense. Instead, breakpoints should be developed around the layout and flow of the content of the website.</p>
    <p>Enter a website URL in the text field, press start, and watch the magic happen. The <code>body</code> tag of Resizive's website animates, constantly changing width and forcing the <code>iframe</code> containing the website indicated by the URL entered to repaint itself. Resizive animates in 50px steps starting from the browser's current width down to 320px wide, and then reverses and animates back to the width of the browser. 320px is an arbitrary low point based the smallest of the common mobile device sizes. Preferably, this arbitary number would not exist, but comparing sites against narrower widths doesn't make any sense. By making the browser's window fullscreen, the best effect will be gained by allowing Resizive to animate to that fullscreen width, displaying the largest range of sizes possible; having said that, Resizive works with browser windows of any size larger than 320px.</p>
    <p>The width of the <code>body</code> tag at any given time is displayed in px during active use. If you notice a breakpoint in the animation where you think you need to apply a media query change, click the pause button. Plus(+) and minus(-) buttons appear that animate in single 10px steps to allow fine tuning to find the perfect break point. <em>Just don't forget to recalculate this pixel measurement as an em or percentage unit for a fluid design!</em></p>
    <p>Resizive allows localhost to be used as a URL as well! Simply enter a URL similar to <code>localhost/~mywebsite/</code> and Resizive will treat it no different than a live URL. Also, if a known specific pixel width needs to checked for a breaking point, pause the resizing animation and edit the displayed width directly. This is very helpful for numbers that are not multiples of 10, or if trying to halt the animation as a precise point is difficult.</p>
    <p>Keyboard controls recognized:</p>
    <ul class="controls">
        <li><code>S</code> : Start Resizing</li>
        <li><code>E</code> : End Resizing</li>
        <li><code>P</code> : Pause</li>
        <li><code>R</code> : Resume</li>
        <li><code>&uarr;, &larr;, -</code> : Decrement 10 pixels in width</li>
        <li><code>&darr;, &rarr;, +</code> : Increment 10 pixels in width</li>
    </ul>
    <p>Developed by <a href="http://bradleystapl.es">Bradley Staples.</a> For comments, feedback, or questions visit my site and contact me, or I'm on Twitter as <a href="https://twitter.com/#!/bradleystaples">@BradleyStaples</a>.</p>
</div><!-- .desc -->
<?php include 'includes/_ga.php'; ?>
</body>
</html>
