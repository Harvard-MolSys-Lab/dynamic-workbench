/**
 * Provides several functions which can interpolate an array of points to 
 * generate an SVG path string.
 * @static
 */
Ext.define('Workspace.objects.Interpolators', {
	statics : function() {
		// The various interpolators supported by the `line` class.
		var d3_svg_lineInterpolators = {
			/**
			 * @method linear
			 * Linear interpolation; generates "L" commands.
			 */
			"linear" : d3_svg_lineLinear,
			/**
			 * @method step-before
			 * Step interpolation; generates "H" and "V" commands.
			 */
			"step-before" : d3_svg_lineStepBefore,
			/**
			 * @method step-after
			 * Step interpolation; generates "H" and "V" commands.
			 */
			"step-after" : d3_svg_lineStepAfter,
			/**
			 * @method basis
			 * B-spline interpolation; generates "C" commands.
			 */
			"basis" : d3_svg_lineBasis,
			/**
			 * @method basis-open
			 * Open B-spline interpolation; generates "C" commands.
			 */
			"basis-open" : d3_svg_lineBasisOpen,
			/**
			 * @method basis
			 * Closed B-spline interpolation; generates "C" commands.
			 */
			"basis-closed" : d3_svg_lineBasisClosed,
			/**
			 * @method bundle
			 */
			"bundle" : d3_svg_lineBundle,
			/**
			 * @method cardinal
			 * Cardinal spline interpolation; generates "C" commands.
			 */
			"cardinal" : d3_svg_lineCardinal,
			/**
			 * @method cardinal-open
			 * Open cardinal spline interpolation; generates "C" commands.
			 */
			"cardinal-open" : d3_svg_lineCardinalOpen,
			/**
			 * @method cardinal-closed
			 * Closed cardinal spline interpolation; generates "C" commands.
			 */
			"cardinal-closed" : d3_svg_lineCardinalClosed,
			/**
			 * @method monotone
			 */
			"monotone" : d3_svg_lineMonotone
		};

		// Linear interpolation; generates "L" commands.
		function d3_svg_lineLinear(points) {
			var path = [], i = 0, n = points.length, p = points[0];
			path.push(p[0], ",", p[1]);
			while(++i < n)path.push("L", (p = points[i])[0], ",", p[1]);
			return path.join("");
		}

		// Step interpolation; generates "H" and "V" commands.
		function d3_svg_lineStepBefore(points) {
			var path = [], i = 0, n = points.length, p = points[0];
			path.push(p[0], ",", p[1]);
			while(++i < n)path.push("V", (p = points[i])[1], "H", p[0]);
			return path.join("");
		}

		// Step interpolation; generates "H" and "V" commands.
		function d3_svg_lineStepAfter(points) {
			var path = [], i = 0, n = points.length, p = points[0];
			path.push(p[0], ",", p[1]);
			while(++i < n)path.push("H", (p = points[i])[0], "V", p[1]);
			return path.join("");
		}

		// Open cardinal spline interpolation; generates "C" commands.
		function d3_svg_lineCardinalOpen(points, tension) {
			return points.length < 4 ? d3_svg_lineLinear(points) : points[1] + d3_svg_lineHermite(points.slice(1, points.length - 1), d3_svg_lineCardinalTangents(points, tension));
		}

		// Closed cardinal spline interpolation; generates "C" commands.
		function d3_svg_lineCardinalClosed(points, tension) {
			return points.length < 3 ? d3_svg_lineLinear(points) : points[0] + d3_svg_lineHermite((points.push(points[0]), points), d3_svg_lineCardinalTangents([points[points.length - 2]]
			.concat(points, [points[1]]), tension));
		}

		// Cardinal spline interpolation; generates "C" commands.
		function d3_svg_lineCardinal(points, tension, closed) {
			return points.length < 3 ? d3_svg_lineLinear(points) : points[0] + d3_svg_lineHermite(points, d3_svg_lineCardinalTangents(points, tension));
		}

		// Hermite spline construction; generates "C" commands.
		function d3_svg_lineHermite(points, tangents) {
			if(tangents.length < 1 || (points.length != tangents.length && points.length != tangents.length + 2)) {
				return d3_svg_lineLinear(points);
			}

			var quad = points.length != tangents.length, path = "", p0 = points[0], p = points[1], t0 = tangents[0], t = t0, pi = 1;

			if(quad) {
				path += "Q" + (p[0] - t0[0] * 2 / 3) + "," + (p[1] - t0[1] * 2 / 3) + "," + p[0] + "," + p[1];
				p0 = points[1];
				pi = 2;
			}

			if(tangents.length > 1) {
				t = tangents[1];
				p = points[pi];
				pi++;
				path += "C" + (p0[0] + t0[0]) + "," + (p0[1] + t0[1]) + "," + (p[0] - t[0]) + "," + (p[1] - t[1]) + "," + p[0] + "," + p[1];
				for(var i = 2; i < tangents.length; i++, pi++) {
					p = points[pi];
					t = tangents[i];
					path += "S" + (p[0] - t[0]) + "," + (p[1] - t[1]) + "," + p[0] + "," + p[1];
				}
			}

			if(quad) {
				var lp = points[pi];
				path += "Q" + (p[0] + t[0] * 2 / 3) + "," + (p[1] + t[1] * 2 / 3) + "," + lp[0] + "," + lp[1];
			}

			return path;
		}

		// Generates tangents for a cardinal spline.
		function d3_svg_lineCardinalTangents(points, tension) {
			var tangents = [], a = (1 - tension) / 2, p0, p1 = points[0], p2 = points[1], i = 1, n = points.length;
			while(++i < n) {
				p0 = p1;
				p1 = p2;
				p2 = points[i];
				tangents.push([a * (p2[0] - p0[0]), a * (p2[1] - p0[1])]);
			}
			return tangents;
		}

		// B-spline interpolation; generates "C" commands.
		function d3_svg_lineBasis(points) {
			if(points.length < 3)
				return d3_svg_lineLinear(points);
			var path = [], i = 1, n = points.length, pi = points[0], x0 = pi[0], y0 = pi[1], px = [x0, x0, x0, (pi = points[1])[0]], py = [y0, y0, y0, pi[1]];
			path.push(x0, ",", y0);
			d3_svg_lineBasisBezier(path, px, py);
			while(++i < n) {
				pi = points[i];
				px.shift();
				px.push(pi[0]);
				py.shift();
				py.push(pi[1]);
				d3_svg_lineBasisBezier(path, px, py);
			}
			i = -1;
			while(++i < 2) {
				px.shift();
				px.push(pi[0]);
				py.shift();
				py.push(pi[1]);
				d3_svg_lineBasisBezier(path, px, py);
			}
			return path.join("");
		}

		// Open B-spline interpolation; generates "C" commands.
		function d3_svg_lineBasisOpen(points) {
			if(points.length < 4)
				return d3_svg_lineLinear(points);
			var path = [], i = -1, n = points.length, pi, px = [0], py = [0];
			while(++i < 3) {
				pi = points[i];
				px.push(pi[0]);
				py.push(pi[1]);
			}
			path.push(d3_svg_lineDot4(d3_svg_lineBasisBezier3, px) + "," + d3_svg_lineDot4(d3_svg_lineBasisBezier3, py)); --i;
			while(++i < n) {
				pi = points[i];
				px.shift();
				px.push(pi[0]);
				py.shift();
				py.push(pi[1]);
				d3_svg_lineBasisBezier(path, px, py);
			}
			return path.join("");
		}

		// Closed B-spline interpolation; generates "C" commands.
		function d3_svg_lineBasisClosed(points) {
			var path, i = -1, n = points.length, m = n + 4, pi, px = [], py = [];
			while(++i < 4) {
				pi = points[i % n];
				px.push(pi[0]);
				py.push(pi[1]);
			}
			path = [d3_svg_lineDot4(d3_svg_lineBasisBezier3, px), ",", d3_svg_lineDot4(d3_svg_lineBasisBezier3, py)]; --i;
			while(++i < m) {
				pi = points[i % n];
				px.shift();
				px.push(pi[0]);
				py.shift();
				py.push(pi[1]);
				d3_svg_lineBasisBezier(path, px, py);
			}
			return path.join("");
		}

		function d3_svg_lineBundle(points, tension) {
			var n = points.length - 1, x0 = points[0][0], y0 = points[0][1], dx = points[n][0] - x0, dy = points[n][1] - y0, i = -1, p, t;
			while(++i <= n) {
				p = points[i];
				t = i / n;
				p[0] = tension * p[0] + (1 - tension) * (x0 + t * dx);
				p[1] = tension * p[1] + (1 - tension) * (y0 + t * dy);
			}
			return d3_svg_lineBasis(points);
		}

		// Returns the dot product of the given four-element vectors.
		function d3_svg_lineDot4(a, b) {
			return a[0] * b[0] + a[1] * b[1] + a[2] * b[2] + a[3] * b[3];
		}

		// Matrix to transform basis (b-spline) control points to bezier
		// control points. Derived from FvD 11.2.8.
		var d3_svg_lineBasisBezier1 = [0, 2 / 3, 1 / 3, 0], d3_svg_lineBasisBezier2 = [0, 1 / 3, 2 / 3, 0], d3_svg_lineBasisBezier3 = [0, 1 / 6, 2 / 3, 1 / 6];

		// Pushes a "C" Bézier curve onto the specified path array, given the
		// two specified four-element arrays which define the control points.
		function d3_svg_lineBasisBezier(path, x, y) {
			path.push("C", d3_svg_lineDot4(d3_svg_lineBasisBezier1, x), ",", d3_svg_lineDot4(d3_svg_lineBasisBezier1, y), ",", d3_svg_lineDot4(d3_svg_lineBasisBezier2, x), ",", d3_svg_lineDot4(d3_svg_lineBasisBezier2, y), ",", d3_svg_lineDot4(d3_svg_lineBasisBezier3, x), ",", d3_svg_lineDot4(d3_svg_lineBasisBezier3, y));
		}

		// Computes the slope from points p0 to p1.
		function d3_svg_lineSlope(p0, p1) {
			return (p1[1] - p0[1]) / (p1[0] - p0[0]);
		}

		// Compute three-point differences for the given points.
		// http://en.wikipedia.org/wiki/Cubic_Hermite_spline#Finite_difference
		function d3_svg_lineFiniteDifferences(points) {
			var i = 0, j = points.length - 1, m = [], p0 = points[0], p1 = points[1], d = m[0] = d3_svg_lineSlope(p0, p1);
			while(++i < j) {
				m[i] = d + ( d = d3_svg_lineSlope( p0 = p1, p1 = points[i + 1]));
			}
			m[i] = d;
			return m;
		}

		// Interpolates the given points using Fritsch-Carlson Monotone cubic Hermite
		// interpolation. Returns an array of tangent vectors. For details, see
		// http://en.wikipedia.org/wiki/Monotone_cubic_interpolation
		function d3_svg_lineMonotoneTangents(points) {
			var tangents = [], d, a, b, s, m = d3_svg_lineFiniteDifferences(points), i = -1, j = points.length - 1;

			// The first two steps are done by computing finite-differences:
			// 1. Compute the slopes of the secant lines between successive points.
			// 2. Initialize the tangents at every point as the average of the secants.

			// Then, for each segment…
			while(++i < j) {
				d = d3_svg_lineSlope(points[i], points[i + 1]);

				// 3. If two successive yk = y{k + 1} are equal (i.e., d is zero), then set
				// mk = m{k + 1} = 0 as the spline connecting these points must be flat to
				// preserve monotonicity. Ignore step 4 and 5 for those k.

				if(Math.abs(d) < 1e-6) {
					m[i] = m[i + 1] = 0;
				} else {
					// 4. Let ak = mk / dk and bk = m{k + 1} / dk.
					a = m[i] / d;
					b = m[i + 1] / d;

					// 5. Prevent overshoot and ensure monotonicity by restricting the
					// magnitude of vector <ak, bk> to a circle of radius 3.
					s = a * a + b * b;
					if(s > 9) {
						s = d * 3 / Math.sqrt(s);
						m[i] = s * a;
						m[i + 1] = s * b;
					}
				}
			}

			// Compute the normalized tangent vector from the slopes. Note that if x is
			// not monotonic, it's possible that the slope will be infinite, so we protect
			// against NaN by setting the coordinate to zero.
			i = -1;
			while(++i <= j) {
				s = (points[Math.min(j, i + 1)][0] - points[Math.max(0, i - 1)][0]) / (6 * (1 + m[i] * m[i]));
				tangents.push([s || 0, m[i] * s || 0]);
			}

			return tangents;
		}

		function d3_svg_lineMonotone(points) {
			return points.length < 3 ? d3_svg_lineLinear(points) : points[0] + d3_svg_lineHermite(points, d3_svg_lineMonotoneTangents(points));
		}

		return d3_svg_lineInterpolators;
	}()
})