//============================================================
// STUDENT NAME: MIAO QI
// MATRIC NO.  : A0159327X
// NUS EMAIL   : E0046706@u.nus.edu
// COMMENTS TO GRADER:
// In the part of the fragment shader, I finished the codes and got the correct answer as the CPU.

// I have tried two ways of representing the texel. One way is more accurate and "safe" and the other one is more "dangerous". But actually they both work and got the right answer.
// I make the second one in my commented line and I tried to explain and compare the two implementions.

// I got the code run on the computer of the lab of Multimedia 2A Room. Actually, I tried on my own Mac which is installed with Windows system and Visual Studio. However it does not run 
// correctly. The possible reasons may be the driver of the GPU of it and may be the version of openGL.
// 
// I hope the grader can run it as expected. If any unexpected things happen, please do not hesitate to contact with me. I have put a lot of efforts and really tried hard.

// Thanks sincerely.

//
// ============================================================
//
// FILE: assign2.frag


// The GL_EXT_gpu_shader4 extension extends GLSL 1.10 with 
// 32-bit integer (int) representation, integer bitwise operators, 
// and the modulus operator (%).

#extension GL_EXT_gpu_shader4 : require

#extension GL_ARB_texture_rectangle : require


uniform sampler2DRect InputTex;  // The input texture.

uniform int TexWidth;   // Always an even number.
uniform int TexHeight;

uniform int PassCount;  // For the very first pass, PassCount == 0.


void main()
{
    float P1 = texture2DRect( InputTex, gl_FragCoord.xy ).a;
    float P2;

    if ( PassCount % 2 == 0 )  // PassCount is Even.
    {
		int row = int( gl_FragCoord.y );
		int column  = int( gl_FragCoord.x );
		vec2 P2Coord;
		
		// Column is even
		if( column % 2 == 0 ){
			// Actually the statement in the next commented line is a "dangerous" way to represent the position the texel.
			// Because in such a situation, the coordinate is a vector of int, which means the position is at or near the boundaries of texels, and it become susceptilbe to floating-point error or different OpenGL implementation.
			 
			// P2Coord = vec2( column - 1, row );

			// So I use the way as the following uncommented statement to represent the position of the texel.
			P2Coord = vec2( gl_FragCoord.x + 1.0, gl_FragCoord.y );
			P2 = texture2DRect( InputTex, P2Coord ).a;
			gl_FragColor = vec4(min(P1,P2));
		}

		// Column is odd
		else{
			P2Coord = vec2( gl_FragCoord.x - 1.0, gl_FragCoord.y );
			P2 = texture2DRect( InputTex, P2Coord ).a;
			gl_FragColor = vec4(max(P1,P2));
		}
    }

    else  // PassCount is Odd.
    {
        int row = int( gl_FragCoord.y );
        int column = int( gl_FragCoord.x );
        int index1D = row * TexWidth + column;

		// Next uncommented codes are the way I think is a better and more accurate implemention


		// The situation when it is at the first of last of the array
		if (index1D == 0 || index1D == TexWidth * TexHeight - 1)
			gl_FragColor = vec4(P1);

		else{
			vec2 P2Coord;
			
			// Column is even
			if (column % 2 == 0 ){
				
				// The special case that it is the first element of a row. The coordinate of the texel P2 now is at the last one of the row below the row of P1.
				if(column == 0)
					P2Coord = vec2( float(TexWidth) - 0.5, gl_FragCoord.y - 1.0);  
				
				// In other cases, P2 is before P1
				else
					P2Coord = vec2( gl_FragCoord.x - 1.0, gl_FragCoord.y);  
				
				P2 = texture2DRect( InputTex, P2Coord ).a;
				gl_FragColor = vec4(max(P1,P2));
			}

			// Column is odd
			else{

				// The special case that it is the last element of a row. The coordinate of the texel P2 now is at the last one of the row over the row of P1.
				if(column == TexWidth - 1)
					P2Coord = vec2( 0.5, gl_FragCoord.y + 1.0);  
				
				// In other cases, P2 is behind P1
				else
					P2Coord = vec2( gl_FragCoord.x + 1.0, gl_FragCoord.y );  
				P2 = texture2DRect( InputTex, P2Coord ).a;
				gl_FragColor = vec4(min(P1,P2));
			}

			
			/*
			This is another implemention I have tried. Here I use index1D to calculate the position of the texel. So the coordinates is made up of a vector of int.
			The result is correct but as mentioned, I think this way is a more "dangerous" way because
			the coordinate is a vector of int, which means the position is at or near the boundaries of texels, and it become susceptilbe to floating-point error or different OpenGL implementation.
			 
			But it is more concise and consists of fewer situations compared to the first implemention and the answer actually is correct. So I also showed it. 

			// The index1D is even
			if (index1D % 2 == 0){
				P2Index1D = index1D - 1;
				P2Coord = vec2( float(P2Index1D % TexWidth) + 0.5, float(P2Index1D / TexWidth) + 0.5);  
				P2 = texture2DRect( InputTex, P2Coord ).a;
				gl_FragColor = vec4(max(P1,P2));
			}
			// The index1D is odd
			else{ 	
				P2Index1D = index1D + 1;
				P2Coord = vec2( float(P2Index1D % TexWidth) + 0.5, float(P2Index1D / TexWidth) + 0.5);  
				P2 = texture2DRect( InputTex, P2Coord ).a;
				gl_FragColor = vec4(min(P1,P2));
			}
			*/

		}
    }
}
